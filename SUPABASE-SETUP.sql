-- ═══════════════════════════════════════════════════════════
--  शिवरक्षक करियर अकॅडमी — Supabase Database Setup
--  हे संपूर्ण file COPY करा → Supabase SQL Editor मध्ये PASTE करा → RUN दाबा
-- ═══════════════════════════════════════════════════════════


-- ┌─────────────────────────────────────────┐
-- │  STEP 1 — 6 TABLES बनवा                 │
-- └─────────────────────────────────────────┘

-- 1️⃣ विद्यार्थी (Students)
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
  course TEXT,
  admission_date DATE,
  duration TEXT,
  age INTEGER,
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  chest NUMERIC(5,2),
  gender TEXT DEFAULT 'male',
  total_fee NUMERIC(10,2) DEFAULT 0,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2️⃣ फी भरणा (Fee Payments)
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT DEFAULT 'cash',
  receipt_no TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3️⃣ कागदपत्रे (Documents)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4️⃣ मेस सदस्यत्व (Mess Subscriptions)
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

-- 5️⃣ सूचना (Notices)
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  attachment_url TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6️⃣ WhatsApp लॉग (WhatsApp Logs)
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  message_type TEXT,
  message_text TEXT,
  status TEXT DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);


-- ┌─────────────────────────────────────────┐
-- │  STEP 2 — 2 VIEWS बनवा                  │
-- └─────────────────────────────────────────┘

-- फी शिल्लक बघण्यासाठी
CREATE OR REPLACE VIEW student_fee_summary AS
SELECT
  s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee,
  COALESCE(SUM(fp.amount_paid), 0) AS total_paid,
  s.total_fee - COALESCE(SUM(fp.amount_paid), 0) AS pending_amount
FROM students s
LEFT JOIN fee_payments fp ON s.id = fp.student_id
GROUP BY s.id, s.name, s.roll_number, s.parent_phone, s.course, s.total_fee;

-- मेस संपणार असलेले विद्यार्थी
CREATE OR REPLACE VIEW mess_expiry_reminders AS
SELECT ms.*, s.name AS student_name, s.phone AS student_phone, s.parent_phone
FROM mess_subscriptions ms
JOIN students s ON ms.student_id = s.id
WHERE ms.is_active = TRUE
  AND ms.end_date <= CURRENT_DATE + INTERVAL '2 days'
  AND ms.end_date >= CURRENT_DATE;


-- ┌─────────────────────────────────────────┐
-- │  STEP 3 — INDEXES (Speed साठी)          │
-- └─────────────────────────────────────────┘

CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_course ON students(course);
CREATE INDEX IF NOT EXISTS idx_students_created ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fee_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_docs_student ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_mess_student ON mess_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_mess_enddate ON mess_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_notices_pub ON notices(is_published, created_at DESC);


-- ┌─────────────────────────────────────────┐
-- │  STEP 4 — ACCESS PERMISSIONS            │
-- │  (Website ला data वाचता/लिहिता यावा)    │
-- └─────────────────────────────────────────┘

ALTER TABLE students            ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs       ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_students"  ON students;
DROP POLICY IF EXISTS "allow_all_fees"      ON fee_payments;
DROP POLICY IF EXISTS "allow_all_docs"      ON documents;
DROP POLICY IF EXISTS "allow_all_mess"      ON mess_subscriptions;
DROP POLICY IF EXISTS "allow_all_notices"   ON notices;
DROP POLICY IF EXISTS "allow_all_wa"        ON whatsapp_logs;

CREATE POLICY "allow_all_students" ON students            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_fees"     ON fee_payments        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_docs"     ON documents           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_mess"     ON mess_subscriptions  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notices"  ON notices             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_wa"       ON whatsapp_logs       FOR ALL USING (true) WITH CHECK (true);


-- ┌─────────────────────────────────────────┐
-- │  STEP 5 — STORAGE BUCKETS               │
-- │  (Photos, कागदपत्रे साठी)               │
-- └─────────────────────────────────────────┘

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('student-photos',    'student-photos',    true),
  ('student-documents', 'student-documents', true),
  ('notices',           'notices',           true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read"   ON storage.objects;
DROP POLICY IF EXISTS "public_upload" ON storage.objects;
DROP POLICY IF EXISTS "public_update" ON storage.objects;
DROP POLICY IF EXISTS "public_delete" ON storage.objects;

CREATE POLICY "public_read"   ON storage.objects FOR SELECT USING (bucket_id IN ('student-photos','student-documents','notices'));
CREATE POLICY "public_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('student-photos','student-documents','notices'));
CREATE POLICY "public_update" ON storage.objects FOR UPDATE USING (bucket_id IN ('student-photos','student-documents','notices'));
CREATE POLICY "public_delete" ON storage.objects FOR DELETE USING (bucket_id IN ('student-photos','student-documents','notices'));


-- ┌─────────────────────────────────────────┐
-- │  STEP 6 — पहिली सूचना (Test साठी)       │
-- └─────────────────────────────────────────┘

INSERT INTO notices (title, content, category, is_published)
VALUES
  ('🎉 शिवरक्षक अकॅडमी वेबसाइट सुरू!', 'आता online प्रवेश अर्ज भरता येईल. अधिक माहितीसाठी 9284842177 वर संपर्क करा.', 'important', true),
  ('🚔 पोलीस भरती 2024-25 Batch सुरू', 'नवीन Batch साठी प्रवेश चालू आहे. लवकर नाव नोंदवा!', 'general', true)
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════
--  ✅ सगळं तयार! आता website वापरू शकता.
-- ═══════════════════════════════════════════
