"use client"

import { useEffect } from "react"
import { appConfig } from "@/lib/env"

export function SeoProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!appConfig.shouldIndex) {
      return
    }

    const APP_URL = appConfig.appUrl
    const APP_NAME = appConfig.appName

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: APP_NAME,
      description: "Plataforma completa para gestão de cuidados com pacientes",
      url: APP_URL,
      logo: `${APP_URL}/icon.svg`,
    }

    const webSiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: APP_NAME,
      url: APP_URL,
      description:
        "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores",
      publisher: {
        "@type": "Organization",
        name: APP_NAME,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    }

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
