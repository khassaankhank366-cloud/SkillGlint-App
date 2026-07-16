/*
# LMS, Scam Reports, Support Tickets, and PIN Lock Schema

## Overview
This migration adds the full Learning Management System (LMS), scam reporting,
support ticketing, and PIN-based security to SkillGlint.

## 1. New Tables

### lessons
- Child of courses table — each course has multiple lessons.
- id, course_id (FK), title, content, order_index, created_at

### user_progress
- Tracks per-user, per-lesson completion state.
- id, user_id (DEFAULT auth.uid()), course_id (FK), lesson_id (FK), completed, created_at
- UNIQUE(user_id, lesson_id)

### scam_reports
- Stores scam-check queries submitted by users.
- id, user_id (DEFAULT auth.uid()), input_value, is_scam, report_notes, created_at

### support_tickets
- Stores help & support form submissions.
- id, user_id (DEFAULT auth.uid()), subject, message, status, created_at

## 2. Modified Tables

### profiles
- Added pin_code (text, nullable) — hashed 4-digit PIN for app-lock security.
- Added pin_enabled (boolean, default false) — whether PIN lock is active.

## 3. Security (RLS)
All new tables have RLS enabled with owner-scoped CRUD policies.
Lessons are read-only reference data visible to all authenticated users.

## 4. Notes
- user_progress.user_id has DEFAULT auth.uid() so frontend inserts omitting user_id will still satisfy the INSERT WITH CHECK policy.
- scam_reports and support_tickets likewise default user_id to auth.uid().
- All policies use DROP IF EXISTS before CREATE for idempotency.
- 3 lessons seeded per existing course.
*/

-- ============ lessons table ============
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_lessons" ON lessons;
CREATE POLICY "select_lessons" ON lessons FOR SELECT
  TO authenticated USING (true);

-- ============ user_progress table ============
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_progress" ON user_progress;
CREATE POLICY "select_own_progress" ON user_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_progress" ON user_progress;
CREATE POLICY "insert_own_progress" ON user_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_progress" ON user_progress;
CREATE POLICY "update_own_progress" ON user_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_progress" ON user_progress;
CREATE POLICY "delete_own_progress" ON user_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ scam_reports table ============
CREATE TABLE IF NOT EXISTS scam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  input_value text NOT NULL,
  is_scam boolean DEFAULT false,
  report_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scam_reports" ON scam_reports;
CREATE POLICY "select_own_scam_reports" ON scam_reports FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_scam_reports" ON scam_reports;
CREATE POLICY "insert_own_scam_reports" ON scam_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_scam_reports" ON scam_reports;
CREATE POLICY "update_own_scam_reports" ON scam_reports FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_scam_reports" ON scam_reports;
CREATE POLICY "delete_own_scam_reports" ON scam_reports FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ support_tickets table ============
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tickets" ON support_tickets;
CREATE POLICY "select_own_tickets" ON support_tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tickets" ON support_tickets;
CREATE POLICY "insert_own_tickets" ON support_tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tickets" ON support_tickets;
CREATE POLICY "update_own_tickets" ON support_tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tickets" ON support_tickets;
CREATE POLICY "delete_own_tickets" ON support_tickets FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ profiles: add pin_code and pin_enabled ============
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pin_code') THEN
    ALTER TABLE profiles ADD COLUMN pin_code text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pin_enabled') THEN
    ALTER TABLE profiles ADD COLUMN pin_enabled boolean DEFAULT false;
  END IF;
END $$;

-- ============ Seed lessons for existing courses ============
INSERT INTO lessons (course_id, title, content, order_index)
SELECT c.id, 'Introduction', 'Welcome to this course. Learn the fundamentals and get started.', 1
FROM courses c
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Introduction')
UNION ALL
SELECT c.id, 'Core Concepts', 'Dive into the core concepts and techniques you need to master.', 2
FROM courses c
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Core Concepts')
UNION ALL
SELECT c.id, 'Practical Application', 'Apply what you have learned with real-world exercises.', 3
FROM courses c
WHERE NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.title = 'Practical Application')
ON CONFLICT DO NOTHING;
