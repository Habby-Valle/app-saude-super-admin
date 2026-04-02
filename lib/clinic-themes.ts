export type ClinicThemeId =
  | "purple"
  | "blue"
  | "teal"
  | "green"
  | "rose"
  | "orange"
  | "indigo"

export interface ClinicTheme {
  id: ClinicThemeId
  label: string
  /** Cor hex aproximada para o swatch de preview */
  color: string
  hue: number
}

export const CLINIC_THEMES: ClinicTheme[] = [
  { id: "purple", label: "Roxo",       color: "#7c3aed", hue: 300 },
  { id: "indigo", label: "Índigo",     color: "#4f46e5", hue: 263 },
  { id: "blue",   label: "Azul",       color: "#2563eb", hue: 220 },
  { id: "teal",   label: "Verde-azul", color: "#0d9488", hue: 185 },
  { id: "green",  label: "Verde",      color: "#16a34a", hue: 145 },
  { id: "orange", label: "Laranja",    color: "#ea580c", hue: 40  },
  { id: "rose",   label: "Rosa",       color: "#e11d48", hue: 10  },
]

export const DEFAULT_THEME: ClinicThemeId = "purple"

export function getTheme(id: string | null | undefined): ClinicTheme {
  return CLINIC_THEMES.find((t) => t.id === id) ?? CLINIC_THEMES[0]
}
