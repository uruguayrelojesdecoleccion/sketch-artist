-- Make project_id nullable to allow analyses without projects
ALTER TABLE public.analyses ALTER COLUMN project_id DROP NOT NULL;