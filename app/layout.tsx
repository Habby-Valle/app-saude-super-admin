import { Geist, Geist_Mono } from "next/font/google"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SeoProvider } from "@/components/layout/seo-provider"
import { appConfig } from "@/lib/env"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const APP_URL = appConfig.appUrl
const APP_NAME = appConfig.appName
const SHOULD_INDEX = appConfig.shouldIndex

const ENV_LABELS = {
  development: "Dev",
  homologation: "Homologação",
  production: "",
}

const ENV_LABEL = ENV_LABELS[appConfig.env]

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
    default: `${ENV_LABEL ? `${ENV_LABEL} - ` : ""}${APP_NAME}`,
    template: `%s | ${APP_NAME}`,
    absolute: `${APP_NAME} - Painel Administrativo`,
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
  robots: SHOULD_INDEX
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      }
    : {
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - Painel Administrativo`,
    description:
      "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} - Painel Administrativo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Painel Administrativo`,
    description:
      "Painel Administrativo Unificado para gestão de clínicas, pacientes e cuidadores.",
    images: ["/og-image.svg"],
    creator: "@appsaude",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
    startupImage: ["/icons/apple-touch-icon.svg"],
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
        {ENV_LABEL && <meta name="robots" content="noindex, nofollow" />}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider>
          <SeoProvider>{children}</SeoProvider>
          <SpeedInsights />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
