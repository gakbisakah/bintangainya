-- Add results_detail and counts to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS results_detail jsonb DEFAULT '[]';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS correct_count integer DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS incorrect_count integer DEFAULT 0;

-- Ensure users can't submit twice if not allowed (already handled in app logic, but good to have)
-- We can add a unique constraint if we want to strictly enforce one submission per student per assignment
-- ALTER TABLE submissions ADD CONSTRAINT one_submission_per_student UNIQUE (assignment_id, student_id);
-- However, existing data might violate this, so we'll leave it to app logic for now or use a policy.
