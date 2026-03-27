# Validações - App Saúde

Este diretório contém schemas Zod para validação de formulários e dados de entrada.

## Estrutura

```
lib/validations/
├── index.ts          # Exporta todos os schemas
├── auth.ts           # Login
├── clinic.ts         # Clínicas
├── user.ts           # Usuários
├── patient.ts       # Pacientes
├── caregiver.ts      # Cuidadores
├── checklist.ts     # Checklists
├── shift.ts         # Turnos
└── sos.ts           # SOS
```

## Uso

### 1. No Cliente (Formulários)

```typescript
import { patientSchema } from "@/lib/validations"

const form = useForm({
  resolver: zodResolver(patientSchema),
  defaultValues: {
    name: "",
    birth_date: "",
  },
})
```

### 2. No Servidor (Server Actions)

```typescript
import { parseWithSanitize } from "@/lib/validation"
import { patientSchema } from "@/lib/validations"

export async function createPatient(data: unknown) {
  const result = parseWithSanitize(patientSchema, data, ["name"])

  if (!result.success) {
    return { success: false, error: result.error }
  }

  // Prosseguir com result.data (já sanitizado)
  const patient = await createPatientInDb(result.data)

  return { success: true, data: patient }
}
```

### 3. Campos que precisam de sanitização

Campos de texto livre DEVEM ser sanitizados:

```typescript
const result = parseWithSanitize(
  patientSchema,
  data,
  ["name"] // Campos a sanitizar
)
```

## Campos com Sanitização Automática

| Schema                  | Campos sanitizados |
| ----------------------- | ------------------ |
| `clinicSchema`          | `name`             |
| `userFormSchema`        | `name`             |
| `patientSchema`         | `name`             |
| `createCaregiverSchema` | `name`             |
| `checklistFormSchema`   | `name`             |
| `checklistItemSchema`   | `name`             |

## Validações Adicionais

### Email

```typescript
import { validateEmail } from "@/lib/validation"

if (!validateEmail(input)) {
  return { error: "Email inválido" }
}
```

### UUID

```typescript
import { validateUuid } from "@/lib/validation"

if (!validateUuid(id)) {
  return { error: "ID inválido" }
}
```

### CNPJ

```typescript
import { validateCnpj } from "@/lib/validation"

if (!validateCnpj(cnpj)) {
  return { error: "CNPJ inválido" }
}
```

### CPF

```typescript
import { validateCpf } from "@/lib/validation"

if (!validateCpf(cpf)) {
  return { error: "CPF inválido" }
}
```

## Regras de Validação

### Nomes

- Mínimo: 2 caracteres
- Máximo: 100 caracteres
- Sanitização: Remove HTML/scripts

### Emails

- Formato válido
- Sem espaços

### Datas

- Formato: YYYY-MM-DD
- Não pode ser futura (birth_date)

### Arrays

- UUIDs válidos
- Não vazio quando obrigatório

## Security

Todas as inputs são:

1. Validadas com Zod
2. Sanitizadas contra XSS
3. Verificadas no servidor antes de usar

Consulte `lib/sanitize.ts` para detalhes de sanitização.
