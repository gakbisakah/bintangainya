-- BintangAi Initial Schema Squash
-- Generated for clean maintenance and scalability

-- 1. Create Custom Types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_grading_tolerance_level') THEN
        CREATE TYPE ai_grading_tolerance_level AS ENUM ('ketat', 'sedang', 'fleksibel');
    END IF;
END $$;

-- 2. Base Tables
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    full_name text,
    role text NOT NULL CHECK (role IN ('siswa', 'guru', 'orang_tua', 'admin')),
    avatar_url text,
    class_code text,
    class_level text,
    subject text,
    slb_name text,
    disability_type text,
    xp integer DEFAULT 0,
    streak integer DEFAULT 0,
    weak_topics text[] DEFAULT '{}',
    linked_student_id uuid REFERENCES profiles(id),
    badges jsonb DEFAULT '[]',
    settings jsonb DEFAULT '{}',
    student_password_hash text,
    created_at timestamp with time zone DEFAULT now(),
    last_active date DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text,
    pdf_url text,
    summary text,
    simplified text,
    is_public boolean DEFAULT false,
    short_id text UNIQUE,
    enroll_key text,
    tags text[] DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
    teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    deadline date,
    duration_minutes integer DEFAULT 30,
    max_attempts integer DEFAULT 1,
    shuffle_questions boolean DEFAULT false,
    allow_late_submission boolean DEFAULT false,
    show_explanation boolean DEFAULT true,
    ai_grading_enabled boolean DEFAULT true,
    ai_grading_tolerance ai_grading_tolerance_level DEFAULT 'sedang',
    is_public boolean DEFAULT false,
    short_id text UNIQUE,
    enroll_key text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
    question_text text NOT NULL,
    question_type text NOT NULL, -- 'multiple_choice', 'essay', 'voice'
    points integer DEFAULT 10,
    correct_answer text,
    ai_explanation text,
    ai_feedback_wrong text,
    rubric_text text,
    difficulty_level text,
    voice_preview_url text,
    order_index integer,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_question_options (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id uuid REFERENCES assignment_questions(id) ON DELETE CASCADE,
    option_text text NOT NULL,
    is_correct boolean DEFAULT false,
    order_index integer
);

CREATE TABLE IF NOT EXISTS submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    status text DEFAULT 'draft', -- 'draft', 'submitted', 'graded'
    attempt_number integer DEFAULT 1,
    total_score integer DEFAULT 0,
    score integer DEFAULT 0,
    ai_feedback_summary text,
    allow_retake boolean DEFAULT false,
    started_at timestamp with time zone,
    submitted_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submission_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid REFERENCES submissions(id) ON DELETE CASCADE,
    question_id uuid REFERENCES assignment_questions(id) ON DELETE CASCADE,
    selected_option_id uuid REFERENCES assignment_question_options(id),
    answer_text text,
    audio_url text,
    points_earned integer DEFAULT 0,
    is_correct boolean,
    ai_feedback text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quizzes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL,
    title text NOT NULL,
    questions jsonb NOT NULL, -- legacy structure support
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    score integer NOT NULL,
    answers jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS xp_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    action text NOT NULL,
    xp_gained integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    password text,
    requires_approval boolean DEFAULT false,
    created_by uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    role text DEFAULT 'member', -- 'admin', 'member'
    joined_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    image_url text,
    audio_url text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    input_text text NOT NULL,
    output_text text NOT NULL,
    model text NOT NULL,
    content_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    question text,
    topic text,
    grade_context text,
    disability_context text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    report_type text,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- 3. Views (Leaderboard)
CREATE OR REPLACE VIEW assignment_leaderboard AS
SELECT
    p.full_name,
    p.avatar_url,
    s.assignment_id,
    MAX(s.total_score) as top_score,
    MIN(s.submitted_at) as first_submitted_at
FROM submissions s
JOIN profiles p ON s.student_id = p.id
WHERE s.status = 'submitted' OR s.status = 'graded'
GROUP BY p.id, s.assignment_id;

-- 4. Essential RPC Functions
CREATE OR REPLACE FUNCTION add_weak_topic(target_user_id uuid, new_topic text)
RETURNS void AS $$
BEGIN
    UPDATE profiles
    SET weak_topics = array_append(ARRAY(SELECT DISTINCT unnest(array_append(weak_topics, new_topic))), new_topic)
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Profiles: Users can read all profiles (for leaderboard/search), but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Modules: Public modules or modules from same class
CREATE POLICY "Modules are viewable by everyone" ON modules FOR SELECT USING (true);

-- Assignments: Viewable if public or same class
CREATE POLICY "Assignments are viewable by everyone" ON assignments FOR SELECT USING (true);

-- Submissions: Students see own, teachers see all
CREATE POLICY "Submissions are viewable by owner and teachers" ON submissions
FOR SELECT USING (auth.uid() = student_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('guru', 'admin')));
CREATE POLICY "Students can insert own submissions" ON submissions FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Study Groups: Everyone can see groups
CREATE POLICY "Study groups are viewable by everyone" ON study_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can create study groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Group Members: Members can see memberships, anyone can join
CREATE POLICY "Group members are viewable by everyone" ON group_members FOR SELECT USING (true);
CREATE POLICY "Anyone can join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Group Messages: Members can see and send messages
CREATE POLICY "Messages viewable by members" ON group_messages FOR SELECT USING (true);
CREATE POLICY "Members can send messages" ON group_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
