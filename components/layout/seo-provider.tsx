"use client"

import { useEffect } from "react"

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "App Saúde",
  description: "Plataforma completa para gestão de cuidados com pacientes",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br",
  logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br"}/icon.svg`,
}

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "App Saúde",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br",
  description:
    "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores",
  publisher: {
    "@type": "Organization",
    name: "App Saúde",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br"}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export function SeoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const schemas = [organizationSchema, webSiteSchema]

    schemas.forEach((schema, index) => {
      const existing = document.getElementById(`json-ld-schema-${index}`)
      if (existing) return

      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.id = `json-ld-schema-${index}`
      script.innerHTML = JSON.stringify(schema)
      document.head.appendChild(script)
    })

    return () => {
      schemas.forEach((_, index) => {
        const el = document.getElementById(`json-ld-schema-${index}`)
        if (el) el.remove()
      })
    }
  }, [])

  return <>{children}</>
}
