import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/terms", "/privacy"],
        disallow: [
          "/dashboard",
          "/profile",
          "/schedules",
          "/crews",
          "/api/",
        ],
      },
    ],
    sitemap: "https://zugzag.vercel.app/sitemap.xml",
  };
}
