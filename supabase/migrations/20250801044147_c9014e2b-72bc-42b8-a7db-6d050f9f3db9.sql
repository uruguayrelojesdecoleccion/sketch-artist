-- Create enum types
CREATE TYPE public.analysis_type AS ENUM ('url', 'screenshot');
CREATE TYPE public.analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE public.component_type AS ENUM ('button', 'input', 'card', 'navigation', 'header', 'footer', 'form', 'modal', 'table', 'other');
CREATE TYPE public.code_format AS ENUM ('html', 'css', 'react', 'tailwind', 'vue', 'angular');

-- Create projects table
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analyses table
CREATE TABLE public.analyses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type analysis_type NOT NULL,
    status analysis_status NOT NULL DEFAULT 'pending',
    source_url TEXT,
    screenshot_url TEXT,
    metadata JSONB,
    ai_prompt TEXT,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create components table
CREATE TABLE public.components (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type component_type NOT NULL DEFAULT 'other',
    description TEXT,
    html_code TEXT,
    css_code TEXT,
    react_code TEXT,
    tailwind_classes TEXT,
    props JSONB,
    position_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create design_systems table
CREATE TABLE public.design_systems (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    colors JSONB NOT NULL DEFAULT '[]',
    fonts JSONB NOT NULL DEFAULT '[]',
    spacing JSONB NOT NULL DEFAULT '[]',
    border_radius JSONB NOT NULL DEFAULT '[]',
    shadows JSONB NOT NULL DEFAULT '[]',
    breakpoints JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create generated_code table
CREATE TABLE public.generated_code (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    format code_format NOT NULL,
    code TEXT NOT NULL,
    filename TEXT,
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_screenshots table
CREATE TABLE public.analysis_screenshots (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    is_original BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analysis_tags table
CREATE TABLE public.analysis_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(analysis_id, tag)
);

-- Create component_templates table
CREATE TABLE public.component_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type component_type NOT NULL DEFAULT 'other',
    html_template TEXT,
    css_template TEXT,
    react_template TEXT,
    tailwind_template TEXT,
    props_schema JSONB,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    default_code_format code_format NOT NULL DEFAULT 'react',
    auto_generate_components BOOLEAN NOT NULL DEFAULT true,
    preferred_css_framework TEXT DEFAULT 'tailwind',
    ai_model_preference TEXT DEFAULT 'gpt-4',
    export_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for projects
CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for analyses
CREATE POLICY "Users can view their own analyses" ON public.analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own analyses" ON public.analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own analyses" ON public.analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own analyses" ON public.analyses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for components
CREATE POLICY "Users can view their own components" ON public.components FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own components" ON public.components FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own components" ON public.components FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own components" ON public.components FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for design_systems
CREATE POLICY "Users can view their own design systems" ON public.design_systems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own design systems" ON public.design_systems FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own design systems" ON public.design_systems FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own design systems" ON public.design_systems FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for generated_code
CREATE POLICY "Users can view their own generated code" ON public.generated_code FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own generated code" ON public.generated_code FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own generated code" ON public.generated_code FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own generated code" ON public.generated_code FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for analysis_screenshots
CREATE POLICY "Users can view their own screenshots" ON public.analysis_screenshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own screenshots" ON public.analysis_screenshots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own screenshots" ON public.analysis_screenshots FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own screenshots" ON public.analysis_screenshots FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for analysis_tags
CREATE POLICY "Users can view their own tags" ON public.analysis_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tags" ON public.analysis_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON public.analysis_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON public.analysis_tags FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for component_templates
CREATE POLICY "Users can view their own templates and public ones" ON public.component_templates FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create their own templates" ON public.component_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.component_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.component_templates FOR DELETE USING (auth.uid() = user_id);

-- Create RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

-- Create Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('analysis-screenshots', 'analysis-screenshots', false);

-- Create storage policies
CREATE POLICY "Users can view their own screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'analysis-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'analysis-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own screenshots" ON storage.objects FOR UPDATE USING (bucket_id = 'analysis-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own screenshots" ON storage.objects FOR DELETE USING (bucket_id = 'analysis-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON public.analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_component_templates_updated_at BEFORE UPDATE ON public.component_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_analyses_project_id ON public.analyses(project_id);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_components_analysis_id ON public.components(analysis_id);
CREATE INDEX idx_components_type ON public.components(type);
CREATE INDEX idx_design_systems_analysis_id ON public.design_systems(analysis_id);
CREATE INDEX idx_generated_code_analysis_id ON public.generated_code(analysis_id);
CREATE INDEX idx_generated_code_format ON public.generated_code(format);
CREATE INDEX idx_analysis_screenshots_analysis_id ON public.analysis_screenshots(analysis_id);
CREATE INDEX idx_analysis_tags_analysis_id ON public.analysis_tags(analysis_id);
CREATE INDEX idx_analysis_tags_tag ON public.analysis_tags(tag);
CREATE INDEX idx_component_templates_user_id ON public.component_templates(user_id);
CREATE INDEX idx_component_templates_type ON public.component_templates(type);
CREATE INDEX idx_component_templates_public ON public.component_templates(is_public);