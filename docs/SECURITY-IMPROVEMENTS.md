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

Prevenir abuse acidental ou malicioso em operações críticas.

### Implementação (In-Memory)

Solução simples usando Map em memória (sem dependências externas).

#### Arquivos

| Arquivo                       | Descrição                       |
| ----------------------------- | ------------------------------- |
| `lib/rate-limit.ts`           | Cliente TypeScript + tipos      |
| `app/api/rate-limit/route.ts` | API route com storage in-memory |

#### Configurações Padrão

| Tier      | Limite | Janela | Uso        |
| --------- | ------ | ------ | ---------- |
| `strict`  | 5      | 60s    | SOS, login |
| `normal`  | 20     | 60s    | Criações   |
| `relaxed` | 100    | 60s    | Leituras   |

#### Uso no Servidor

```typescript
import { withRateLimit, RateLimitTier } from "@/lib/rate-limit"

export async function createPatient(data: unknown) {
  return withRateLimit("create-patient", "normal", userId, async () => {
    // sua lógica aqui
  })
}
```

#### Como funciona

1. API route `/api/rate-limit` mantém um `Map` em memória
2. Cada chave (ex: `create-patient:user123`) tem contagem + timestamp de expiração
3. Cleanup automático a cada 5 minutos
4. Retorna 429 quando limite excedido

#### Endpoints Configurados

| Endpoint       | Limite | Janela |
| -------------- | ------ | ------ |
| Login          | 5      | 60s    |
| Criar cuidador | 20     | 60s    |
| Criar paciente | 20     | 60s    |
| Criar clínica  | 10     | 60s    |
| SOS            | 5      | 60s    |

#### Limitação

Esta solução é **por instância**. Em ambiente serverless (Vercel), cada instância tem sua própria memória, então o rate limiting não é compartilhado entre instâncias. Para produção de alto volume, considere Redis.

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

## 4. Security Headers (Feature 34)

### Por quê?

Headers de segurança protegem contra ataques comuns na web:

- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing
- Man-in-the-middle (com HSTS)
- Information leakage

### Headers Implementados

| Header                    | Valor                            | Proteção                       |
| ------------------------- | -------------------------------- | ------------------------------ |
| X-DNS-Prefetch-Control    | on                               | DNS prefetch controlado        |
| Strict-Transport-Security | max-age=63072000; preload        | HTTPS obrigatório (2 anos)     |
| X-Frame-Options           | SAMEORIGIN                       | Clickjacking prevention        |
| X-Content-Type-Options    | nosniff                          | MIME sniffing prevention       |
| X-XSS-Protection          | 1; mode=block                    | XSS filter (legacy browsers)   |
| Referrer-Policy           | origin-when-cross-origin         | Controle de referrer           |
| Permissions-Policy        | camera=(), microphone=(), geo=() | Desabilita APIs não utilizadas |
| Content-Security-Policy   | Ver abaixo                       | XSS e injection prevention     |

### Content-Security-Policy Detalhado

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'self';
base-uri 'self';
form-action 'self';
```

### Implementação

O arquivo `next.config.mjs` configura todos os headers:

```javascript
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Content-Security-Policy", value: "default-src 'self'; ..." },
  // ...
]

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}
```

### Nota sobre HSTS

O header `Strict-Transport-Security` requer que o domínio esteja acessível via HTTPS. Para que funcione corretamente:

1. Configure HTTPS no Vercel (automático)
2. O `preload` flag requer submissão em hstspreload.org (opcional)

---

## 5. Checklist de Segurança

- [x] Variáveis de ambiente em `.env` (nunca commitadas)
- [x] `SERVICE_ROLE_KEY` protegida e rotacionada periodicamente
- [x] RLS habilitado em todas as tabelas
- [x] Logs de auditoria implementados
- [x] Rate limiting configurado
- [x] Triggers de trigger implementados
- [x] HTTPS forçado (HSTS header)
- [x] CORS configurado corretamente
- [x] Input validation (Zod) em todas as forms
- [x] Sanitização de inputs
- [x] Security headers (CSP, X-Frame-Options, etc.)

---

## 6. Variáveis de Ambiente Obrigatórias

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

## 7. Monitoramento

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

---

## 8. Criptografia de Dados (LGPD)

### Implementação

O sistema usa **AES-256-GCM** (padrão militar) via módulo nativo do Node.js `crypto`, sem dependências externas.

### Arquivos

| Arquivo         | Descrição                                                                    |
| --------------- | ---------------------------------------------------------------------------- |
| `lib/crypto.ts` | Funções `encrypt()`, `decrypt()`, `encryptIfPresent()`, `decryptIfPresent()` |
| `.env.local`    | `ENCRYPTION_KEY` configurada                                                 |

### Campos Criptografados

| Tabela       | Campo              | Tipo            | Integração   |
| ------------ | ------------------ | --------------- | ------------ |
| `sos_alerts` | `notes`            | Observações SOS | ✅ Integrado |
| `sos_alerts` | `location_lat/lng` | Coordenadas GPS | ✅ Integrado |

### Migração Progressiva

A função `decryptIfPresent()` permite migração progressiva:

- Dados antigos em texto plano são lidos normalmente
- Novos dados são criptografados automaticamente
- Sem necessidade de migrar dados existentes

### Uso nos Server Actions

```typescript
import { encryptIfPresent, decryptIfPresent } from "@/lib/crypto"

// Ao salvar (criptografar)
updateData.notes = encryptIfPresent(notes)

// Ao ler (descriptografar)
notes: decryptIfPresent(data.notes)
```

### Chave de Criptografia

Gerar nova chave (não commitar):

```bash
openssl rand -base64 32
```

Adicionar ao `.env.local`:

```
ENCRYPTION_KEY=<sua-chave-aqui>
```
