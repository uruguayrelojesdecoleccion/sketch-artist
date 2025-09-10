-- Create site_blueprints table for comprehensive website analysis
CREATE TABLE public.site_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  sitemap JSONB DEFAULT '[]'::jsonb,
  pages JSONB DEFAULT '[]'::jsonb,
  design_tokens JSONB DEFAULT '{}'::jsonb,
  component_library JSONB DEFAULT '[]'::jsonb,
  assets JSONB DEFAULT '{}'::jsonb,
  seo_structure JSONB DEFAULT '{}'::jsonb,
  third_party_integrations JSONB DEFAULT '[]'::jsonb,
  accessibility_features JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  robots_txt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_blueprints ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own site blueprints" 
ON public.site_blueprints 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own site blueprints" 
ON public.site_blueprints 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own site blueprints" 
ON public.site_blueprints 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own site blueprints" 
ON public.site_blueprints 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_site_blueprints_updated_at
BEFORE UPDATE ON public.site_blueprints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();