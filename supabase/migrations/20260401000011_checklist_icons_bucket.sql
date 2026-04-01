-- Bucket público para ícones de checklists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'checklist-icons',
  'checklist-icons',
  true,
  2097152, -- 2MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- Qualquer usuário autenticado pode fazer upload
create policy "authenticated_upload_checklist_icons"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'checklist-icons');

-- Leitura pública (bucket é público, mas policy garante)
create policy "public_read_checklist_icons"
  on storage.objects for select
  to public
  using (bucket_id = 'checklist-icons');

-- Apenas service role pode deletar (via admin client)
create policy "service_delete_checklist_icons"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'checklist-icons');
