// Temporarily commented until types are generated
// import { supabase } from "@/integrations/supabase/client";

export interface Project {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export const projectService = {
  // TODO: Implement after types are generated
  async createProject(data: CreateProjectData): Promise<Project> {
    throw new Error('Not implemented yet');
  },

  async getUserProjects(): Promise<Project[]> {
    throw new Error('Not implemented yet');
  },

  async getProject(id: string): Promise<Project> {
    throw new Error('Not implemented yet');
  },

  async updateProject(id: string, updates: Partial<CreateProjectData>): Promise<Project> {
    throw new Error('Not implemented yet');
  },

  async deleteProject(id: string): Promise<void> {
    throw new Error('Not implemented yet');
  }
};