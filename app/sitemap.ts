import { MetadataRoute } from "next"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://appsaude.com.br"

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/login",
    "/super-admin-dashboard",
    "/super-admin-clinics",
    "/super-admin-users",
    "/super-admin-patients",
    "/super-admin-checklists",
    "/super-admin-reports",
    "/super-admin-audit-logs",
    "/super-admin-settings",
    "/super-admin-sos",
    "/admin-dashboard",
    "/admin-patients",
    "/admin-caregivers",
    "/admin-shifts",
    "/admin-checklists",
    "/admin-reports",
    "/admin-sos",
  ]

  return routes.map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }))
}
