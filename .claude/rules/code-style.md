# Regras de Estilo de Código (Super Admin)

- Sempre use TypeScript strict mode
- Server Components por padrão ("use client" apenas quando necessário)
- Nome de arquivos: kebab-case (ex: clinic-form.tsx)
- Nome de componentes: PascalCase
- Prefira `cn()` do utils.ts para classes condicionais
- Mantenha componentes pequenos e focados em uma responsabilidade
- Sempre adicione comentários em trechos complexos de lógica de permissão ou multi-tenant
- Use Server Actions para todas as mutações sensíveis (criar clínica, alterar role, etc.)