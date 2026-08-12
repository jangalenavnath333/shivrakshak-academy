-- Admission payment approval workflow
-- Public form -> admin approval -> first fee entry -> code/exam/print activation.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS admission_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS code_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS print_enabled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activation_fee_payment_id UUID REFERENCES public.fee_payments(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'students_admission_status_check'
      AND conrelid = 'public.students'::regclass
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_admission_status_check
      CHECK (admission_status IN ('pending', 'approved', 'payment_recorded', 'active'));
  END IF;
END $$;

UPDATE public.students
SET admission_status = CASE
  WHEN is_active THEN 'active'
  ELSE 'pending'
END
WHERE admission_status = 'active';

CREATE INDEX IF NOT EXISTS students_admission_status_created_idx
  ON public.students (admission_status, created_at DESC);
CREATE INDEX IF NOT EXISTS students_approved_by_idx ON public.students (approved_by);
CREATE INDEX IF NOT EXISTS students_activation_fee_payment_idx ON public.students (activation_fee_payment_id);

CREATE TABLE IF NOT EXISTS public.pending_student_credentials (
  student_id UUID PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  password_encrypted TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consumed_at TIMESTAMPTZ
);

ALTER TABLE public.pending_student_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manage pending student credentials" ON public.pending_student_credentials;
CREATE POLICY "admin manage pending student credentials"
ON public.pending_student_credentials
FOR ALL
TO authenticated
USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

CREATE TABLE IF NOT EXISTS public.admission_print_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS admission_print_tokens_student_idx
  ON public.admission_print_tokens (student_id, created_at DESC);

ALTER TABLE public.admission_print_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin manage admission print tokens" ON public.admission_print_tokens;
CREATE POLICY "admin manage admission print tokens"
ON public.admission_print_tokens
FOR ALL
TO authenticated
USING (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
WITH CHECK (((SELECT auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

DROP VIEW IF EXISTS public.student_fee_summary;
CREATE VIEW public.student_fee_summary
WITH (security_invoker = true)
AS
SELECT
  s.id,
  s.name,
  s.roll_number,
  s.parent_phone,
  s.course,
  s.total_fee,
  s.admission_status,
  COALESCE(SUM(fp.amount_paid), 0) AS total_paid,
  s.total_fee - COALESCE(SUM(fp.amount_paid), 0) AS pending_amount
FROM public.students s
LEFT JOIN public.fee_payments fp ON s.id = fp.student_id
WHERE s.admission_status IN ('approved', 'payment_recorded', 'active')
GROUP BY s.id;

GRANT SELECT ON public.student_fee_summary TO authenticated;

CREATE OR REPLACE FUNCTION public.activate_paid_admission(
  p_student_id UUID,
  p_total_fee NUMERIC,
  p_amount_paid NUMERIC,
  p_payment_date DATE,
  p_payment_mode TEXT,
  p_print_token_hash TEXT
)
RETURNS TABLE (
  student_id UUID,
  roll_number TEXT,
  auth_user_id UUID,
  student_name TEXT,
  admission_details JSONB,
  total_fee NUMERIC,
  payment_id UUID,
  already_paid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_roll_number TEXT;
  v_payment_id UUID;
  v_token_hash TEXT;
BEGIN
  IF p_total_fee <= 0 OR p_amount_paid <= 0 OR p_amount_paid > p_total_fee THEN
    RAISE EXCEPTION 'Invalid fee amounts';
  END IF;

  IF p_payment_mode NOT IN ('cash', 'upi', 'bank_transfer', 'cheque') THEN
    RAISE EXCEPTION 'Invalid payment mode';
  END IF;

  SELECT * INTO v_student
  FROM public.students
  WHERE id = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found';
  END IF;

  IF v_student.admission_status NOT IN ('approved', 'payment_recorded') THEN
    RAISE EXCEPTION 'Admission is not approved for payment';
  END IF;

  v_roll_number := COALESCE(v_student.roll_number, public.next_admission_code());

  IF v_student.admission_status = 'approved' THEN
    INSERT INTO public.fee_payments (
      student_id,
      amount_paid,
      payment_date,
      payment_mode,
      receipt_no,
      notes
    ) VALUES (
      v_student.id,
      p_amount_paid,
      p_payment_date,
      p_payment_mode,
      'ADM-' || v_roll_number,
      'First fee payment - admission activation'
    ) RETURNING id INTO v_payment_id;

    UPDATE public.students
    SET total_fee = p_total_fee,
        roll_number = v_roll_number,
        admission_status = 'payment_recorded',
        activation_fee_payment_id = v_payment_id,
        code_generated_at = COALESCE(code_generated_at, NOW()),
        updated_at = NOW()
    WHERE id = v_student.id;
  ELSE
    v_payment_id := v_student.activation_fee_payment_id;
  END IF;

  IF v_student.admission_status = 'payment_recorded' THEN
    SELECT apt.token_hash INTO v_token_hash
    FROM public.admission_print_tokens apt
    WHERE apt.student_id = v_student.id
      AND apt.revoked_at IS NULL
    ORDER BY apt.created_at DESC
    LIMIT 1;
    IF v_token_hash IS NULL OR v_token_hash <> p_print_token_hash THEN
      RAISE EXCEPTION 'Admission activation is being reconciled. Use the existing print link.';
    END IF;
  END IF;

  INSERT INTO public.admission_print_tokens (student_id, token_hash)
  VALUES (v_student.id, p_print_token_hash)
  ON CONFLICT (token_hash) DO NOTHING;

  RETURN QUERY
  SELECT
    s.id,
    s.roll_number,
    s.auth_user_id,
    s.name,
    s.admission_details,
    s.total_fee,
    s.activation_fee_payment_id,
    (v_student.admission_status = 'payment_recorded')
  FROM public.students s
  WHERE s.id = v_student.id;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_paid_admission(UUID, NUMERIC, NUMERIC, DATE, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_paid_admission(UUID, NUMERIC, NUMERIC, DATE, TEXT, TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.activate_paid_admission(UUID, NUMERIC, NUMERIC, DATE, TEXT, TEXT) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.activate_paid_admission(UUID, NUMERIC, NUMERIC, DATE, TEXT, TEXT) TO service_role;
