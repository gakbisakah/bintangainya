-- Add columns for targeted module delivery
ALTER TABLE modules ADD COLUMN IF NOT EXISTS target_students uuid[] DEFAULT '{}';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS target_classes text[] DEFAULT '{}';

-- Update RLS Policy for modules
DROP POLICY IF EXISTS "Modules are viewable by everyone" ON modules;

CREATE POLICY "Modules viewable by target or if public" ON modules
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
