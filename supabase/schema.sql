-- =============================================
-- शिवरक्षक करियर अकॅडमी — Database Schema
-- Supabase SQL Editor मध्ये हे run करा
-- =============================================

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

