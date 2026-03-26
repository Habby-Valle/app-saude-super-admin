# Melhorias de Segurança - App Saúde

> Recomendações e melhores práticas de segurança para o painel administrativo.

---

## 1. Auditoria de Operações Sensíveis

### Por quê?

Registrar operações sensíveis (criação de usuários, exclusões, etc.) permite:

- Rastrear quem fez o quê e quando
- Investigar incidentes de segurança
- Compliance (LGPD)
- Detectar comportamento anômalo

### Implementação

#### Opção A: Log via Server Action

```typescript
// lib/audit.ts
"use server"

import { createAdminClient } from "@/lib/supabase-admin"

export async function logAuditEvent(params: {
  userId: string
  action: string
  entity: string
  entityId: string
  metadata?: Record<string, unknown>
  clinicId?: string
}) {
  const adminClient = createAdminClient()

  await adminClient.from("audit_logs").insert({
    user_id: params.userId,
    action: params.action,
    entity: params.entity,
    entity_id: params.entityId,
    metadata: params.metadata ?? {},
    clinic_id: params.clinicId,
  })
}
```

#### Uso nas Server Actions

```typescript
// Em createCaregiver actions
import { logAuditEvent } from "@/lib/audit"

export async function createCaregiver(data: ...) {
  // ... validação ...

  const { authData, error } = await adminClient.auth.admin.createUser(...)

  if (authData.user) {
    await logAuditEvent({
      userId: authData.user.id,
      action: "create_caregiver",
      entity: "users",
      entityId: authData.user.id,
      metadata: { email: data.email, name: data.name },
      clinicId,
    })
  }
}
```

#### Tabela audit_logs (se não existir)

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  clinic_id UUID REFERENCES clinics(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Super Admin vê tudo, Clinic Admin vê apenas da própria clínica
CREATE POLICY "audit_logs_read_super_admin" ON audit_logs
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin')
  OR clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "audit_logs_insert" ON audit_logs
FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 2. Rate Limiting

### Por quê?

Prevenir abuse acidental ou malicioso:

- Evitar spam de criações
- Prevenir brute force
- Controlar custos (Supabase cobra por operações)

### Implementação com Supabase

#### Política de Rate Limit por Clinic

```sql
-- Criar função para verificar rate limit
CREATE OR REPLACE FUNCTION check_user_creation_rate()
RETURNS TRIGGER AS $$
DECLARE
  creations_last_hour INTEGER;
  max_creations INTEGER := 100; -- máximo por hora
BEGIN
  SELECT COUNT(*) INTO creations_last_hour
  FROM audit_logs
  WHERE action = 'create_caregiver'
    AND clinic_id = NEW.clinic_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF creations_last_hour >= max_creations THEN
    RAISE EXCEPTION 'Rate limit exceeded: max % creations per hour', max_creations;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Associar trigger
CREATE TRIGGER enforce_user_creation_rate
BEFORE INSERT ON audit_logs
FOR EACH ROW
WHEN (NEW.action = 'create_caregiver')
EXECUTE FUNCTION check_user_creation_rate();
```

#### Rate Limit por IP (Edge Function)

```typescript
// supabase/functions/rate-limit/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RATE_LIMIT = 100 // requests per minute
const WINDOW_MS = 60 * 1000

serve(async (req) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  )

  // Verificar rate limit no Redis ou banco
  const { data } = await supabase
    .from("rate_limits")
    .select("count")
    .eq("ip", ip)
    .single()

  if (data && data.count >= RATE_LIMIT) {
    return new Response("Rate limit exceeded", { status: 429 })
  }

  // Incrementar contador
  await supabase.from("rate_limits").upsert({
    ip,
    count: (data?.count || 0) + 1,
    window_start: new Date().toISOString(),
  })

  return new Response("OK")
})
```

---

## 3. Trigger Automático (User Profile)

### Por quê?

Eliminar a necessidade de admin client para operações de INSERT na tabela `users`.

### Implementação

#### Trigger: Criar perfil ao criar usuário no auth

```sql
-- 1. Criar função de trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, clinic_id, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'caregiver'),
    NEW.raw_user_meta_data->>'clinic_id',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Associar trigger ao auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
```

#### Benefícios

| Antes                                 | Depois                     |
| ------------------------------------- | -------------------------- |
| `adminClient.auth.admin.createUser()` | Mesma função               |
| `adminClient.from("users").insert()`  | **Automático via trigger** |

#### Código refatorado

```typescript
export async function createCaregiver(data: ...) {
  const { supabase, clinicId } = await requireClinicAdmin()
  const adminClient = createAdminClient()

  // Apenas cria no auth - perfil é criado automaticamente pelo trigger
  const { data: authData, error } = await adminClient.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: {
      name: data.name,
      role: "caregiver",
      clinic_id: clinicId,
    },
  })

  // Não precisa mais fazer INSERT em public.users!

  if (authData.user) {
    await logAuditEvent({
      userId: authData.user.id,
      action: "create_caregiver",
      entity: "users",
      entityId: authData.user.id,
    })
  }
}
```

---

## 4. Checklist de Segurança

- [ ] Variáveis de ambiente em `.env` (nunca commitadas)
- [ ] `SERVICE_ROLE_KEY` protegida e rotacionada periodicamente
- [ ] RLS habilitado em todas as tabelas
- [ ] Logs de auditoria implementados
- [ ] Rate limiting configurado
- [ ] Triggers de trigger implementados
- [ ] HTTPS forçado
- [ ] CORS configurado corretamente
- [ ] Input validation (Zod) em todas as forms
- [ ] Sanitização de inputs

---

## 5. Variáveis de Ambiente Obrigatórias

```bash
# .env (NUNCA COMMITAR ESTE ARQUIVO)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Apenas para Server Actions!
```

### Verificar no gitignore

```bash
# .gitignore
.env
.env.local
.env.*.local
```

---

## 6. Monitoramento

### Métricas para monitorar

| Métrica                       | Limiar | Ação               |
| ----------------------------- | ------ | ------------------ |
| Taxa de erros de autenticação | > 5%   | Investigar         |
| Criações de usuário/hora      | > 100  | Rate limit         |
| Queries lentas                | > 1s   | Otimizar índices   |
| Uso de storage                | > 80%  | Cleanup ou upgrade |

### Alertas sugeridos

- Email/Slack para erros 5xx
- Dashboard no Supabase para métricas
- Log-based alerts para ações suspeitas
