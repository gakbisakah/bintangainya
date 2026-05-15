-- Add answer column to log full chat history
ALTER TABLE ai_interactions ADD COLUMN IF NOT EXISTS answer text;

-- Add index for performance on large datasets
CREATE INDEX IF NOT EXISTS idx_ai_interactions_student_id ON ai_interactions(student_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at DESC);

-- View for Teachers to monitor student AI interactions with full history
-- This provides a cleaner interface for the teacher dashboard to fetch reports
CREATE OR REPLACE VIEW student_ai_chat_history AS
SELECT
    ai.id,
    ai.student_id,
    p.full_name as student_name,
    p.class_code,
    ai.question,
    ai.answer,
    ai.topic,
    ai.created_at,
    ai.grade_context,
    ai.disability_context
FROM ai_interactions ai
JOIN profiles p ON ai.student_id = p.id;

-- Ensure RLS allows teachers to see interactions of students in their class
-- (Profiles table already has class_code, teachers also have class_code)
ALTER VIEW student_ai_chat_history SET (security_invoker = on);
