---
name: super-admin-security
description: Aplica regras de segurança e multi-tenant específicas para o Super Admin do App Saúde.
---

# Super Admin Security & Multi-Tenant Rules

- Verifique sempre se o usuário atual é `super_admin`
- Permita acesso global (ignore clinic_id) apenas para super_admin
- Use Server Actions com validação explícita de role
- Registre ações críticas (criar clínica, mudar role, etc.)
- Nunca permita operações em massa sem confirmação explícita