# Regras de Segurança e Multi-Tenant (Obrigatório)

- Todo registro deve conter `clinic_id`
- Super Admin pode ignorar `clinic_id` (acesso global)
- Nunca permita que um usuário comum acesse dados de outra clínica
- Sempre valide o `role = 'super_admin'` no middleware e nas Server Actions
- Use RLS (Row Level Security) + verificação explícita no código para operações críticas
- Registre todas as ações do Super Admin em tabela de auditoria (futuro)
- Nunca exponha dados sensíveis de pacientes no Super Admin sem necessidade