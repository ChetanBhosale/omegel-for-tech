import type { MetadataRoute } from "next";
import { SITE, absoluteUrl } from "@/lib/seo";
import { POSTS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE.domain,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("index.md"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("omegle-alternative-for-developers"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("omegle-alternative-for-developers.md"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("blog.md"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = POSTS.flatMap((post) => [
    {
      url: absoluteUrl(`blog/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl(`blog/${post.slug}.md`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]);

  return [...staticPages, ...blogPages];
}
