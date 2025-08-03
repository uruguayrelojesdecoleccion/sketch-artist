import { supabase } from "@/integrations/supabase/client";

export interface Analysis {
  id: string;
  project_id?: string;
  type: 'url' | 'screenshot';
  source_url?: string;
  screenshot_url?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: any;
  user_id: string;
  created_at: string;
  updated_at: string;
  processing_time_ms?: number;
  ai_prompt?: string;
}

export interface CreateAnalysisData {
  project_id?: string;
  type: 'url' | 'screenshot';
  source_url?: string;
  metadata?: any;
}

export interface AnalysisResults {
  components: any[];
  styles: any;
  layout: any;
  fullCode: any;
}

export const analysisService = {
  async createAnalysis(data: CreateAnalysisData): Promise<Analysis> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        project_id: data.project_id,
        type: data.type,
        source_url: data.source_url,
        user_id: user.id,
        status: 'pending',
        metadata: data.metadata
      })
      .select()
      .single();

    if (error) throw error;
    return analysis;
  },

  async getUserAnalyses(): Promise<Analysis[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAnalysis(id: string): Promise<Analysis> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateAnalysisStatus(id: string, status: Analysis['status'], metadata?: any): Promise<Analysis> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('analyses')
      .update({ 
        status, 
        metadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async processScreenshot(analysisId: string, imageFile: File): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    // Convert file to base64 with proper handling
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    // Call edge function
    const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
      body: {
        analysisId,
        imageBase64: base64,
        projectId: null
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
  },

  async processUrl(analysisId: string, url: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');

    // Call edge function
    const { data, error } = await supabase.functions.invoke('analyze-url', {
      body: {
        analysisId,
        url,
        projectId: null
      }
    });

    if (error) throw error;
    if (!data.success) throw new Error(data.error);
  },

  async getAnalysisWithResults(id: string): Promise<{
    analysis: Analysis;
    components: any[];
    designSystem: any;
    generatedCode: any[];
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (analysisError) throw analysisError;

    // Get components
    const { data: components, error: componentsError } = await supabase
      .from('components')
      .select('*')
      .eq('analysis_id', id)
      .eq('user_id', user.id);

    if (componentsError) throw componentsError;

    // Get design system
    const { data: designSystems, error: designError } = await supabase
      .from('design_systems')
      .select('*')
      .eq('analysis_id', id)
      .eq('user_id', user.id);

    if (designError) throw designError;

    // Get generated code
    const { data: generatedCode, error: codeError } = await supabase
      .from('generated_code')
      .select('*')
      .eq('analysis_id', id)
      .eq('user_id', user.id);

    if (codeError) throw codeError;

    return {
      analysis,
      components: components || [],
      designSystem: designSystems?.[0] || null,
      generatedCode: generatedCode || []
    };
  }
};