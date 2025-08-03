import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate environment variables
const validateEnvironment = () => {
  const required = {
    'OPENAI_API_KEY': Deno.env.get('OPENAI_API_KEY'),
    'FIRECRAWL_API_KEY': Deno.env.get('FIRECRAWL_API_KEY'),
    'SUPABASE_URL': Deno.env.get('SUPABASE_URL'),
    'SUPABASE_SERVICE_ROLE_KEY': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  };
  
  for (const [key, value] of Object.entries(required)) {
    if (!value) {
      throw new Error(`${key} environment variable is required`);
    }
  }
  
  console.log('Environment validation passed');
  return required;
};

// Retry logic for API calls
const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempt ${i + 1}/${maxRetries} for ${url}`);
      const response = await fetch(url, options);
      
      if (response.ok) {
        console.log(`Success on attempt ${i + 1}`);
        return response;
      }
      
      if (response.status === 429) {
        // Rate limit - wait and retry
        const waitTime = 1000 * Math.pow(2, i); // Exponential backoff
        console.log(`Rate limited, waiting ${waitTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      const waitTime = 1000 * (i + 1);
      console.log(`Waiting ${waitTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  // If we reach here, all retries failed
  throw new Error(`Failed after ${maxRetries} attempts`);
};

const env = validateEnvironment();
const openAIApiKey = env['OPENAI_API_KEY']!;
const firecrawlApiKey = env['FIRECRAWL_API_KEY']!;
const supabaseUrl = env['SUPABASE_URL']!;
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { analysisId, url, projectId } = await req.json();

    console.log('Starting URL analysis for:', url);

    // Update analysis status to processing
    await supabase
      .from('analyses')
      .update({
        status: 'processing',
        source_url: url,
        ai_prompt: 'Firecrawl + GPT-4 Vision analysis of web page'
      })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    // Scrape with Firecrawl
    console.log('Starting Firecrawl scraping...');
    const firecrawlResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html', 'screenshot'],
        includeTags: ['title', 'meta', 'link'],
        excludeTags: ['script', 'style'],
        waitFor: 2000,
        screenshot: {
          mode: 'desktop',
          fullPage: true
        }
      }),
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.statusText}`);
    }

    const firecrawlData = await firecrawlResponse.json();
    
    if (!firecrawlData.success) {
      throw new Error('Firecrawl scraping failed');
    }

    console.log('Firecrawl scraping completed, analyzing with OpenAI...');

    // Prepare content for OpenAI
    const htmlContent = firecrawlData.data.html || '';
    const markdownContent = firecrawlData.data.markdown || '';
    const screenshotBase64 = firecrawlData.data.screenshot;

    const analysisPrompt = `
Eres un experto en análisis de sitios web. Analiza esta página web y extrae:

1. **COMPONENTES UI** (máximo 12):
   - Identifica elementos como header, navigation, hero, cards, buttons, forms, footer, etc.
   - Para cada componente proporciona: nombre, tipo, descripción

2. **DESIGN SYSTEM**:
   - Colores: paleta de colores de la marca (máximo 8 colores)
   - Tipografías: fuentes utilizadas
   - Espaciado: sistema de espaciado
   - Componentes: patrones reutilizables

3. **CÓDIGO LIMPIO**:
   - HTML semántico y estructurado
   - CSS moderno con variables
   - Componente React profesional
   - Clases Tailwind optimizadas

CONTENIDO HTML:
${htmlContent.substring(0, 8000)}

CONTENIDO MARKDOWN:
${markdownContent.substring(0, 4000)}

Responde SOLO con un JSON válido con esta estructura:
{
  "components": [
    {
      "name": "string",
      "type": "header|navigation|hero|card|button|form|footer|sidebar|modal|other",
      "description": "string",
      "html": "string",
      "css": "string",
      "react": "string", 
      "tailwind": "string"
    }
  ],
  "designSystem": {
    "colors": [{"name": "string", "value": "string", "usage": "string"}],
    "fonts": [{"family": "string", "sizes": ["string"], "weights": ["string"]}],
    "spacing": [{"name": "string", "value": "string"}],
    "borderRadius": [{"name": "string", "value": "string"}],
    "shadows": [{"name": "string", "value": "string"}]
  },
  "generatedCode": {
    "html": "string",
    "css": "string",
    "react": "string", 
    "tailwind": "string"
  }
}`;

    const messages = [
      { role: 'user', content: [{ type: 'text', text: analysisPrompt }] }
    ];

    // Add screenshot if available
    if (screenshotBase64) {
      messages[0].content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/png;base64,${screenshotBase64}`
        }
      });
    }

    console.log('Calling OpenAI API...');
    const openAIResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisResult = JSON.parse(openAIData.choices[0].message.content);

    console.log('OpenAI analysis completed, saving results...');

    // Save screenshot if available
    if (screenshotBase64) {
      const screenshotBuffer = Uint8Array.from(atob(screenshotBase64), c => c.charCodeAt(0));
      const screenshotPath = `screenshots/${analysisId}/original.png`;

      const { error: uploadError } = await supabase.storage
        .from('analysis-screenshots')
        .upload(screenshotPath, screenshotBuffer, {
          contentType: 'image/png'
        });

      if (!uploadError) {
        await supabase
          .from('analysis_screenshots')
          .insert({
            analysis_id: analysisId,
            user_id: user.id,
            file_name: 'original.png',
            file_path: screenshotPath,
            mime_type: 'image/png',
            file_size: screenshotBuffer.length,
            is_original: true
          });

        // Update analysis with screenshot URL
        await supabase
          .from('analyses')
          .update({ screenshot_url: screenshotPath })
          .eq('id', analysisId);
      }
    }

    // Save components
    for (const component of analysisResult.components) {
      await supabase
        .from('components')
        .insert({
          analysis_id: analysisId,
          user_id: user.id,
          name: component.name,
          type: component.type,
          description: component.description,
          html_code: component.html,
          css_code: component.css,
          react_code: component.react,
          tailwind_classes: component.tailwind
        });
    }

    // Save design system
    await supabase
      .from('design_systems')
      .insert({
        analysis_id: analysisId,
        user_id: user.id,
        colors: analysisResult.designSystem.colors,
        fonts: analysisResult.designSystem.fonts,
        spacing: analysisResult.designSystem.spacing,
        border_radius: analysisResult.designSystem.borderRadius,
        shadows: analysisResult.designSystem.shadows
      });

    // Save generated code
    const codeFormats = ['html', 'css', 'react', 'tailwind'];
    for (const format of codeFormats) {
      if (analysisResult.generatedCode[format]) {
        await supabase
          .from('generated_code')
          .insert({
            analysis_id: analysisId,
            user_id: user.id,
            format: format,
            code: analysisResult.generatedCode[format],
            filename: `generated.${format === 'react' ? 'jsx' : format}`
          });
      }
    }

    // Update analysis status to completed
    await supabase
      .from('analyses')
      .update({
        status: 'completed',
        processing_time_ms: Date.now() - new Date().getTime(),
        metadata: { 
          components_count: analysisResult.components.length,
          original_url: url,
          scrape_success: true
        }
      })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    console.log('URL analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysisId,
      componentsCount: analysisResult.components.length,
      hasScreenshot: !!screenshotBase64
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-url function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});