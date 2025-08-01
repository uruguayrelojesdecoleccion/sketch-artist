// Temporarily commented until types are generated
// import { supabase } from "@/integrations/supabase/client";

export const storageService = {
  // TODO: Implement after types are generated
  async uploadAnalysisScreenshot(file: File, analysisId: string): Promise<string> {
    throw new Error('Not implemented yet');
  },

  async getScreenshotUrl(filePath: string): Promise<string> {
    throw new Error('Not implemented yet');
  },

  async deleteScreenshot(filePath: string): Promise<void> {
    throw new Error('Not implemented yet');
  }
};