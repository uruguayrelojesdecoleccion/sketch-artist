import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
    const analysisResult = JSON.parse(openAIData.choices[0].message.content);

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
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});