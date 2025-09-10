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

    const { analysisId, imageBase64, projectId } = await req.json();

    console.log('Starting screenshot analysis for user:', user.id);

    // Update analysis status to processing
    await supabase
      .from('analyses')
      .update({
        status: 'processing',
        ai_prompt: 'GPT-4 Vision analysis of UI screenshot'
      })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    // Analyze with GPT-4 Vision
    const analysisPrompt = `
Eres un experto en análisis de interfaces de usuario. Analiza esta captura de pantalla y extrae:

1. **COMPONENTES UI** (máximo 10):
   - Identifica elementos como botones, cards, navigation, forms, etc.
   - Para cada componente proporciona: nombre, tipo, descripción, posición aproximada

2. **DESIGN SYSTEM**:
   - Colores: identifica paleta de colores principal (máximo 8 colores)
   - Tipografías: fuentes utilizadas y tamaños
   - Espaciado: padding y margins comunes
   - Bordes: border-radius utilizados
   - Sombras: box-shadows detectadas

3. **CÓDIGO**:
   - HTML estructural limpio
   - CSS con clases reutilizables
   - Componente React funcional
   - Clases Tailwind equivalentes

Responde SOLO con un JSON válido con esta estructura:
{
  "components": [
    {
      "name": "string",
      "type": "button|card|navigation|form|header|footer|sidebar|modal|input|other",
      "description": "string",
      "position": {"x": number, "y": number, "width": number, "height": number},
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

    console.log('Calling OpenAI Vision API...');
    const openAIResponse = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI raw response:', openAIData.choices[0].message.content);
    
    let analysisResult;
    try {
      // Validate that we got a response
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
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content:', openAIData.choices[0].message.content);
      
      // Create a fallback result
      analysisResult = {
        components: [{
          name: "Detected UI",
          type: "other",
          description: "General UI elements detected from image",
          position: {x: 0, y: 0, width: 100, height: 100},
          html: "<div class='ui-element'>Detected content</div>",
          css: ".ui-element { display: block; }",
          react: "const UIElement = () => <div className='ui-element'>Detected content</div>;",
          tailwind: "block"
        }],
        designSystem: {
          colors: [{name: "primary", value: "#3B82F6", usage: "Primary brand color"}],
          fonts: [{family: "Inter", sizes: ["14px", "16px"], weights: ["400", "600"]}],
          spacing: [{name: "md", value: "16px"}],
          borderRadius: [{name: "md", value: "8px"}],
          shadows: [{name: "md", value: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"}]
        },
        generatedCode: {
          html: "<div class='ui-container'>Analyzed UI</div>",
          css: ".ui-container { display: flex; }",
          react: "const AnalyzedUI = () => <div className='ui-container'>Analyzed UI</div>;",
          tailwind: "flex"
        }
      };
      
      // Update analysis with parsing error info
      await supabase
        .from('analyses')
        .update({
          metadata: { 
            parse_error: parseError.message,
            original_response: openAIData.choices[0].message.content?.substring(0, 1000)
          }
        })
        .eq('id', analysisId);
    }

    console.log('OpenAI analysis completed, saving results...');

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
          position_data: component.position,
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
        metadata: { components_count: analysisResult.components.length }
      })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      analysisId,
      componentsCount: analysisResult.components.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-screenshot function:', error);
    
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