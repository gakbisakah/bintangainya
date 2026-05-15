-- Ensure the check constraint allows both Indonesian and English terms for maximum compatibility
ALTER TABLE assignment_questions DROP CONSTRAINT IF EXISTS assignment_questions_question_type_check;

ALTER TABLE assignment_questions ADD CONSTRAINT assignment_questions_question_type_check
CHECK (question_type IN ('pilihan_ganda', 'esai', 'suara', 'multiple_choice', 'essay', 'voice'));
