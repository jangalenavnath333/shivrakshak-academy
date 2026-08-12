-- =============================================
-- शिवरक्षक करियर अकॅडमी — Database Schema
-- Supabase SQL Editor मध्ये हे run करा
-- =============================================

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  roll_number TEXT UNIQUE,
  name TEXT NOT NULL,
  parent_name TEXT,
  address TEXT,
  phone TEXT,
  parent_phone TEXT,
  aadhaar_no TEXT,
  guarantee_letter_no TEXT,
  dob DATE,
  course TEXT CHECK (course IN ('police','navy','mpsc','staff_selection','saral_seva','army','railway','other')),
  admission_date DATE,
  duration TEXT,
  age INTEGER,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  chest NUMERIC(5,2),
  gender TEXT DEFAULT 'male' CHECK (gender IN ('male','female')),
  total_fee NUMERIC(10,2) DEFAULT 0,
  photo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  admission_details JSONB NOT NULL DEFAULT '{}'::JSONB
    CHECK (jsonb_typeof(admission_details) = 'object'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fee payments table
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash','upi','bank_transfer','cheque')),
  receipt_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('photo','signature','aadhaar_front','aadhaar_back','marksheet_10','marksheet_12','caste_certificate','domicile','sports_certificate','other','aadhaar','school_leaving','caste','parent_aadhaar')),
  file_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mess subscriptions table
CREATE TABLE IF NOT EXISTS mess_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student leave register. Full reminder locking/RLS is defined in student-leave-system.sql.
CREATE TABLE IF NOT EXISTS student_leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','on_leave','returned','cancelled')),
  notification_email TEXT,
  notification_phone TEXT,
  notify_email BOOLEAN NOT NULL DEFAULT TRUE,
  notify_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
  confirmation_email_sent_at TIMESTAMPTZ,
  confirmation_whatsapp_sent_at TIMESTAMPTZ,
  reminder_email_status TEXT NOT NULL DEFAULT 'pending' CHECK (reminder_email_status IN ('pending','sent','skipped','failed')),
  reminder_whatsapp_status TEXT NOT NULL DEFAULT 'pending' CHECK (reminder_whatsapp_status IN ('pending','sent','skipped','failed')),
  reminder_email_sent_at TIMESTAMPTZ,
  reminder_whatsapp_sent_at TIMESTAMPTZ,
  reminder_claimed_at TIMESTAMPTZ,
  reminder_processed_at TIMESTAMPTZ,
  last_notification_error TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (return_date >= departure_date)
);

-- Notices / Question Papers table
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general','exam','result','holiday','important')),
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Online exams. Correct answers are deliberately stored in a separate locked table.
CREATE TABLE IF NOT EXISTS exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL DEFAULT 'all',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  total_marks NUMERIC(10,2) NOT NULL DEFAULT 0,
  negative_marks NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (negative_marks >= 0),
  pass_marks NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (pass_marks >= 0),
  max_attempts INTEGER NOT NULL DEFAULT 1 CHECK (max_attempts BETWEEN 1 AND 10),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  result_release_at TIMESTAMPTZ,
  is_live BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) BETWEEN 2 AND 8),
  marks NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (marks > 0),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exam_question_keys (
  question_id UUID PRIMARY KEY REFERENCES exam_questions(id) ON DELETE CASCADE,
  correct_option TEXT NOT NULL CHECK (correct_option ~ '^[0-9]+$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attempt_no INTEGER NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  score NUMERIC(10,2),
  max_score NUMERIC(10,2),
  percentage NUMERIC(6,2),
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','evaluated')),
  UNIQUE (exam_id, student_id, attempt_no)
);

CREATE TABLE IF NOT EXISTS exam_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  selected_option TEXT,
  is_correct BOOLEAN,
  marks_awarded NUMERIC(8,2),
  UNIQUE (attempt_id, question_id)
);

-- WhatsApp message logs
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('fee_reminder','mess_reminder','official_notice','custom')),
  message_text TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent','failed','pending')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Useful Views
-- =============================================

-- Student fee summary view
CREATE OR REPLACE VIEW student_fee_summary AS
SELECT
  s.id,
  s.name,
  s.roll_number,
  s.parent_phone,
  s.course,
  s.total_fee,
  COALESCE(SUM(fp.amount_paid), 0) AS total_paid,
  s.total_fee - COALESCE(SUM(fp.amount_paid), 0) AS pending_amount
FROM students s
LEFT JOIN fee_payments fp ON s.id = fp.student_id
GROUP BY s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee;

-- Mess expiry reminder view (expires within next 2 days)
CREATE OR REPLACE VIEW mess_expiry_reminders AS
SELECT
  ms.*,
  s.name AS student_name,
  s.phone AS student_phone,
  s.parent_phone
FROM mess_subscriptions ms
JOIN students s ON ms.student_id = s.id
WHERE ms.is_active = TRUE
  AND ms.end_date <= CURRENT_DATE + INTERVAL '2 days'
  AND ms.end_date >= CURRENT_DATE;

-- =============================================
-- Enable Row Level Security (optional for admin-only)
-- =============================================
-- ALTER TABLE students ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE mess_subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
