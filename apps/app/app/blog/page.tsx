import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing/landing-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { POSTS } from "@/lib/blog";
import { DISPLAY_FONT } from "@/lib/fonts";
import { SITE, absoluteUrl } from "@/lib/seo";

const TITLE = "Developer Video Chat Blog: Tips, Stories & Updates";
const DESCRIPTION =
  "Read our latest articles on random video chat safety, developer networking tips, and behind-the-scenes stories of building the ultimate Omegle alternative.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl("blog") },
  openGraph: {
    type: "website",
    title: `${TITLE} — ${SITE.name}`,
    description: DESCRIPTION,
    url: absoluteUrl("blog"),
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndex() {
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE.domain },
          { name: "Blog", url: absoluteUrl("blog") },
        ]}
      />

      <main className="relative min-h-svh bg-background">
        <LandingNav />

        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 py-16">
          <h1
            className="text-4xl text-foreground sm:text-6xl"
            style={DISPLAY_FONT}
          >
            From the blog
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{DESCRIPTION}</p>

          <div className="mt-12 divide-y divide-border">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block py-8"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>·</span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2 className="mt-2 text-2xl font-medium text-foreground transition-colors group-hover:text-muted-foreground">
                  {post.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
                <span className="mt-3 inline-block text-sm text-foreground underline-offset-4 group-hover:underline">
                  Read more
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
