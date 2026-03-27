import { MetadataRoute } from "next"
import { SHOULD_INDEX, appConfig } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SHOULD_INDEX) {
    return []
  }

  const APP_URL = appConfig.appUrl

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
