-- Adiciona coluna logo_url na tabela clinics
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Cria bucket público para logos de clínicas (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-logos', 'clinic-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: qualquer pessoa pode ler logos (bucket público)
CREATE POLICY "Public read clinic logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'clinic-logos');

-- Políticas de escrita usam as funções SECURITY DEFINER existentes
-- (get_my_role / get_my_clinic_id) para evitar recursão no RLS.
-- Na prática o upload é feito pelo service role (admin client) nas
-- Server Actions, então estas policies são camada de defesa extra.

CREATE POLICY "Super admin manage clinic logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinic-logos'
    AND public.get_my_role() = 'super_admin'
  );

CREATE POLICY "Super admin update clinic logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clinic-logos'
    AND public.get_my_role() = 'super_admin'
  );

CREATE POLICY "Super admin delete clinic logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clinic-logos'
    AND public.get_my_role() = 'super_admin'
  );

CREATE POLICY "Clinic admin manage own logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'clinic-logos'
    AND public.get_my_role() = 'clinic_admin'
    AND (storage.foldername(name))[1] = public.get_my_clinic_id()::text
  );

CREATE POLICY "Clinic admin update own logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'clinic-logos'
    AND public.get_my_role() = 'clinic_admin'
    AND (storage.foldername(name))[1] = public.get_my_clinic_id()::text
  );

CREATE POLICY "Clinic admin delete own logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'clinic-logos'
    AND public.get_my_role() = 'clinic_admin'
    AND (storage.foldername(name))[1] = public.get_my_clinic_id()::text
  );
