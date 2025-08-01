// Temporarily commented until types are generated
// import { supabase } from "@/integrations/supabase/client";

export interface Analysis {
  id: string;
  project_id?: string;
  input_type: 'url' | 'screenshot';
  input_data: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAnalysisData {
  project_id?: string;
  input_type: 'url' | 'screenshot';
  input_data: string;
  metadata?: any;
}

export interface AnalysisResults {
  components: any[];
  styles: any;
  layout: any;
  fullCode: any;
}

export const analysisService = {
  // TODO: Implement after types are generated
  async createAnalysis(data: CreateAnalysisData): Promise<Analysis> {
    throw new Error('Not implemented yet');
  },

  async getUserAnalyses(): Promise<Analysis[]> {
    throw new Error('Not implemented yet');
  },

  async getAnalysis(id: string): Promise<Analysis> {
    throw new Error('Not implemented yet');
  },

  async updateAnalysisStatus(id: string, status: Analysis['status'], metadata?: any): Promise<Analysis> {
    throw new Error('Not implemented yet');
  },

  async saveAnalysisResults(analysisId: string, results: AnalysisResults): Promise<void> {
    throw new Error('Not implemented yet');
  },

  async getAnalysisWithResults(id: string): Promise<{
    analysis: Analysis;
    components: any[];
    designSystem: any;
    generatedCode: any;
  }> {
    throw new Error('Not implemented yet');
  }
};