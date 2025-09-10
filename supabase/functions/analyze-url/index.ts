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

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      throw new Error(`Invalid URL format: ${url}`);
    }

    // Scrape with Firecrawl
    console.log('Starting Firecrawl scraping...');
    let firecrawlResponse;
    try {
      firecrawlResponse = await fetchWithRetry('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta', 'link'],
          excludeTags: ['script', 'style'],
          waitFor: 3000
        }),
      });
    } catch (firecrawlError) {
      console.error('Firecrawl API error details:', firecrawlError);
      
      // Update analysis with error
      await supabase
        .from('analyses')
        .update({
          status: 'failed',
          metadata: { 
            error_type: 'firecrawl_error',
            error_message: firecrawlError.message,
            url: url
          }
        })
        .eq('id', analysisId);
      
      throw new Error(`Failed to scrape URL: ${firecrawlError.message}`);
    }

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

    // Check robots.txt
    const domain = new URL(url).hostname;
    let robotsTxt = '';
    try {
      const robotsResponse = await fetch(`${new URL(url).origin}/robots.txt`);
      if (robotsResponse.ok) {
        robotsTxt = await robotsResponse.text();
        console.log('Retrieved robots.txt');
      }
    } catch (error) {
      console.log('No robots.txt found');
    }

    // Check sitemap.xml
    let sitemapUrls = [];
    try {
      const sitemapResponse = await fetch(`${new URL(url).origin}/sitemap.xml`);
      if (sitemapResponse.ok) {
        const sitemapText = await sitemapResponse.text();
        const urlMatches = sitemapText.match(/<loc>(.*?)<\/loc>/g);
        if (urlMatches) {
          sitemapUrls = urlMatches.map(match => match.replace(/<\/?loc>/g, '')).slice(0, 20);
          console.log(`Found ${sitemapUrls.length} URLs in sitemap`);
        }
      }
    } catch (error) {
      console.log('No sitemap.xml found');
    }

    const analysisPrompt = `
Eres un experto en análisis de sitios web. Analiza esta página web y extrae información COMPLETA para crear un site blueprint:

1. **COMPONENTES UI** (máximo 15):
   - Identifica elementos como header, navigation, hero, cards, buttons, forms, footer, etc.
   - Para cada componente proporciona: nombre, tipo, descripción

2. **DESIGN SYSTEM COMPLETO**:
   - Colores: paleta completa de colores (primary, secondary, accent, etc.)
   - Tipografías: todas las fuentes, tamaños y pesos utilizados
   - Espaciado: sistema de espaciado (margins, paddings)
   - Border radius: esquinas redondeadas utilizadas
   - Sombras: efectos de sombra aplicados
   - Breakpoints: puntos de quiebre para responsive design

3. **SITEMAP Y NAVEGACIÓN**:
   - Enlaces de navegación encontrados
   - Estructura de páginas
   - Menús y submenús

4. **ASSETS Y RECURSOS**:
   - Imágenes importantes (logos, iconos, hero images)
   - Fuentes externas utilizadas
   - CDNs y recursos externos

5. **SEO Y METADATA**:
   - Meta tags importantes
   - Títulos y descripciones
   - Structured data si existe

6. **INTEGRACIONES**:
   - Analytics (Google Analytics, etc.)
   - Redes sociales
   - Chat widgets o herramientas de terceros

CONTENIDO HTML:
${htmlContent.substring(0, 12000)}

CONTENIDO MARKDOWN:
${markdownContent.substring(0, 6000)}

ROBOTS.TXT:
${robotsTxt}

SITEMAP URLS:
${sitemapUrls.join('\n')}

Responde SOLO con un JSON válido con esta estructura:
{
  "siteBlueprint": {
    "domain": "${domain}",
    "sitemap": [{"url": "string", "title": "string", "type": "page|section"}],
    "pages": [{"url": "string", "title": "string", "description": "string", "components": ["string"]}],
    "designTokens": {
      "colors": [{"name": "string", "value": "string", "usage": "string"}],
      "fonts": [{"family": "string", "sizes": ["string"], "weights": ["string"], "source": "google|local|cdn"}],
      "spacing": [{"name": "string", "value": "string"}],
      "borderRadius": [{"name": "string", "value": "string"}],
      "shadows": [{"name": "string", "value": "string"}],
      "breakpoints": [{"name": "string", "value": "string"}]
    },
    "componentLibrary": [
      {
        "name": "string",
        "type": "header|navigation|hero|card|button|form|footer|sidebar|modal|other",
        "description": "string",
        "variants": ["string"],
        "props": ["string"],
        "html": "string",
        "css": "string",
        "react": "string", 
        "tailwind": "string"
      }
    ],
    "assets": {
      "images": [{"src": "string", "alt": "string", "type": "logo|icon|hero|banner|other"}],
      "fonts": [{"family": "string", "source": "string"}],
      "icons": [{"name": "string", "library": "string"}]
    },
    "seoStructure": {
      "title": "string",
      "description": "string",
      "keywords": ["string"],
      "ogTags": [{"property": "string", "content": "string"}],
      "structuredData": [{"type": "string", "data": "object"}]
    },
    "thirdPartyIntegrations": [
      {"name": "string", "type": "analytics|social|chat|payment|other", "details": "string"}
    ],
    "accessibilityFeatures": {
      "hasAltTexts": "boolean",
      "hasAriaLabels": "boolean",
      "hasSkipLinks": "boolean",
      "colorContrast": "good|fair|poor"
    }
  },
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
    console.log('OpenAI raw response length:', openAIData.choices[0].message.content?.length);
    
    let analysisResult;
    try {
      // Validate OpenAI response
      if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
        throw new Error('Invalid OpenAI response format');
      }
      
      const content = openAIData.choices[0].message.content;
      if (!content) {
        throw new Error('OpenAI returned empty content');
      }
      
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      
      analysisResult = JSON.parse(jsonString);
      
      // Validate the structure
      if (!analysisResult.components || !analysisResult.designSystem || !analysisResult.generatedCode) {
        throw new Error('Invalid analysis result structure');
      }
      
      // Save site blueprint if available
      if (analysisResult.siteBlueprint) {
        console.log('Saving site blueprint data...');
        await supabase
          .from('site_blueprints')
          .insert({
            analysis_id: analysisId,
            user_id: user.id,
            domain: analysisResult.siteBlueprint.domain,
            sitemap: analysisResult.siteBlueprint.sitemap || [],
            pages: analysisResult.siteBlueprint.pages || [],
            design_tokens: analysisResult.siteBlueprint.designTokens || {},
            component_library: analysisResult.siteBlueprint.componentLibrary || [],
            assets: analysisResult.siteBlueprint.assets || {},
            seo_structure: analysisResult.siteBlueprint.seoStructure || {},
            third_party_integrations: analysisResult.siteBlueprint.thirdPartyIntegrations || [],
            accessibility_features: analysisResult.siteBlueprint.accessibilityFeatures || {},
            robots_txt: robotsTxt
          });
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content preview:', openAIData.choices[0].message.content?.substring(0, 500));
      
      // Create a fallback result
      analysisResult = {
        components: [{
          name: "Website Header",
          type: "header",
          description: "Main website header extracted from URL",
          html: "<header class='header'>Header Content</header>",
          css: ".header { display: flex; justify-content: space-between; }",
          react: "const Header = () => <header className='header'>Header Content</header>;",
          tailwind: "flex justify-between"
        }],
        designSystem: {
          colors: [{name: "primary", value: "#2563EB", usage: "Primary brand color"}],
          fonts: [{family: "System UI", sizes: ["14px", "16px", "18px"], weights: ["400", "600"]}],
          spacing: [{name: "base", value: "16px"}],
          borderRadius: [{name: "default", value: "6px"}],
          shadows: [{name: "default", value: "0 1px 3px rgba(0, 0, 0, 0.1)"}]
        },
        generatedCode: {
          html: "<div class='page-container'>Website Content</div>",
          css: ".page-container { max-width: 1200px; margin: 0 auto; }",
          react: "const PageContainer = () => <div className='page-container'>Website Content</div>;",
          tailwind: "max-w-6xl mx-auto"
        }
      };
      
      // Update analysis with parsing error info
      await supabase
        .from('analyses')
        .update({
          metadata: { 
            parse_error: parseError.message,
            original_response_preview: openAIData.choices[0].message.content?.substring(0, 1000),
            url: url
          }
        })
        .eq('id', analysisId);
    }

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
    
    // Update analysis status to failed
    try {
      const { analysisId } = await req.json();
      if (analysisId) {
        await supabase
          .from('analyses')
          .update({
            status: 'failed',
            metadata: { 
              error_type: 'function_error',
              error_message: error.message
            }
          })
          .eq('id', analysisId);
      }
    } catch (updateError) {
      console.error('Failed to update analysis status:', updateError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      error_type: error.name || 'AnalysisError'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});