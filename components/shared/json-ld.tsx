"use client"

import { useEffect } from "react"

interface JsonLdProps {
  data: Record<string, unknown>
}

export function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script")
    script.type = "application/ld+json"
    script.innerHTML = JSON.stringify(data)
    script.id = "json-ld-schema"

    const existing = document.getElementById("json-ld-schema")
    if (existing) {
      existing.remove()
    }

    document.head.appendChild(script)

    return () => {
      const el = document.getElementById("json-ld-schema")
      if (el) el.remove()
    }
  }, [data])

  return null
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "App Saúde",
  description: "Plataforma completa para gestão de cuidados com pacientes",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br",
  logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br"}/icon.svg`,
  sameAs: [
    "https://www.instagram.com/appsaude",
    "https://www.linkedin.com/company/appsaude",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "pt-BR",
  },
}

export const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "App Saúde",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br",
  description:
    "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores",
  publisher: {
    "@type": "Organization",
    name: "App Saúde",
    logo: {
      "@type": "ImageObject",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br"}/icon.svg`,
    },
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

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "App Saúde",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  description:
    "Plataforma completa para gestão de cuidados com pacientes, cuidadores e clínicas de saúde",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br",
}
