/*
# Create jobs and courses tables with sample data

1. New Tables
- `jobs`: Freelance job listings (title, company, pay, rating)
- `courses`: Learning courses (title, lessons, progress, icon_name)
2. Security
- RLS enabled, SELECT-only for authenticated users (read-only reference data)
3. Sample Data
- 6 job listings and 6 courses seeded
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  pay text NOT NULL,
  rating numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_jobs" ON jobs;
CREATE POLICY "select_jobs" ON jobs FOR SELECT
  TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  lessons integer DEFAULT 0,
  progress integer DEFAULT 0,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_courses" ON courses;
CREATE POLICY "select_courses" ON courses FOR SELECT
  TO authenticated USING (true);

INSERT INTO jobs (title, company, pay, rating) VALUES
  ('Data Entry Specialist', 'TechFlow', '$22/hr', 4.8),
  ('Virtual Assistant', 'RemoteFirst', '$25/hr', 4.6),
  ('Social Media Designer', 'CreativeHub', '$30/hr', 4.9),
  ('AI Trainer', 'NeuralAI', '$40/hr', 4.7),
  ('Content Writer', 'WriteHub', '$28/hr', 4.5),
  ('Freelance PM', 'Upwork Pro', '$32/hr', 4.8)
ON CONFLICT DO NOTHING;

INSERT INTO courses (title, lessons, progress, icon_name) VALUES
  ('Copy-Paste Mastery', 8, 0, 'FileText'),
  ('Canva Design Pro', 12, 0, 'Palette'),
  ('AI Tools Bootcamp', 10, 0, 'Brain'),
  ('Freelance Success', 15, 0, 'Trophy'),
  ('Data Entry Pro', 6, 0, 'BookOpen'),
  ('Content Writing', 9, 0, 'BookOpen')
ON CONFLICT DO NOTHING;
