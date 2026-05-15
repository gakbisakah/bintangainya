-- Add columns for targeted assignment delivery
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_students uuid[] DEFAULT '{}';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS target_classes text[] DEFAULT '{}';

-- Update RLS Policy for assignments
DROP POLICY IF EXISTS "Assignments are viewable by everyone" ON assignments;

CREATE POLICY "Assignments viewable by target or if public" ON assignments
FOR SELECT USING (
    is_public = true OR
    teacher_id = auth.uid() OR
    (auth.uid() = ANY(target_students)) OR
    (EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND class_code = ANY(target_classes)
    ))
);
