import { MetadataRoute } from "next"
import { SHOULD_INDEX, appConfig } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  const APP_URL = appConfig.appUrl

  const baseRules = {
    userAgent: "*",
    allow: "/",
    disallow: ["/api/", "/_next/", "/admin/"],
  }

  if (!SHOULD_INDEX) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${APP_URL}/sitemap.xml`,
    }
  }

  return {
    rules: [baseRules],
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  }
}
