import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep the app surface and API out of the index.
      disallow: ["/match", "/api/"],
    },
    sitemap: absoluteUrl("sitemap.xml"),
    host: SITE.domain,
  };
}
