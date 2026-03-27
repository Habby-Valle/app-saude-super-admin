import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata, Viewport } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SeoProvider } from "@/components/layout/seo-provider"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br"

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: no-preference)", color: "#764b9d" },
  ],
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "App Saúde",
    template: "%s | App Saúde",
    absolute: "App Saúde - Painel Administrativo",
  },
  description:
    "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores. Plataforma completa de cuidados de saúde.",
  keywords: [
    "saúde",
    "clínicas",
    "pacientes",
    "cuidadores",
    "gestão hospitalar",
    "checklists",
    "turnos",
    "SOS",
    "telemedicina",
  ],
  authors: [{ name: "App Saúde" }],
  creator: "App Saúde",
  publisher: "App Saúde",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: "App Saúde",
    title: "App Saúde - Painel Administrativo",
    description:
      "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "App Saúde - Painel Administrativo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "App Saúde - Painel Administrativo",
    description:
      "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores.",
    images: ["/og-image.png"],
    creator: "@appsaude",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "App Saúde",
    startupImage: ["/icons/apple-touch-icon.png"],
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: APP_URL,
    languages: {
      "pt-BR": APP_URL,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider>
          <SeoProvider>{children}</SeoProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
