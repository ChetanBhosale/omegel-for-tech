import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingNav } from "@/components/landing/landing-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import { StartButton } from "@/components/landing/start-button";
import { ArticleJsonLd, BreadcrumbJsonLd, BlogFaqJsonLd } from "@/components/seo/json-ld";
import { POSTS, getPost } from "@/lib/blog";
import { DISPLAY_FONT } from "@/lib/fonts";
import { SITE, absoluteUrl } from "@/lib/seo";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = absoluteUrl(`blog/${post.slug}`);
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.title} — ${SITE.name}`,
      description: post.description,
      url,
      publishedTime: post.date,
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [
            {
              url: "/og.png",
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.description}
        slug={post.slug}
        date={post.date}
      />
      <BlogFaqJsonLd sections={post.sections} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: SITE.domain },
          { name: "Blog", url: absoluteUrl("blog") },
          { name: post.title, url: absoluteUrl(`blog/${post.slug}`) },
        ]}
      />

      <main className="relative min-h-svh bg-background">
        <LandingNav />

        <article className="relative z-10 mx-auto w-full max-w-2xl px-6 py-16">
          <Link
            href="/blog"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to blog
          </Link>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingMinutes} min read</span>
          </div>

          <h1
            className="mt-3 text-4xl leading-tight text-foreground sm:text-5xl"
            style={DISPLAY_FONT}
          >
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            {post.description}
          </p>

          {post.image && (
            <div className="mt-8 overflow-hidden rounded-2xl border border-border">
              <img
                src={post.image}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          <div className="mt-12 flex flex-col gap-10">
            {post.sections.map((section, i) => (
              <section key={i}>
                {section.heading && (
                  <h2 className="text-2xl font-medium text-foreground">
                    {section.heading}
                  </h2>
                )}
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="mt-4 text-base leading-relaxed text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: p }}
                  />
                ))}
              </section>
            ))}
          </div>

          {/* Inline CTA */}
          <div className="mt-16 rounded-2xl border border-border bg-card/40 p-8 text-center backdrop-blur-sm">
            <h2
              className="text-2xl text-foreground"
              style={DISPLAY_FONT}
            >
              Try it for yourself
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Sign in with GitHub and get matched with another developer in
              seconds.
            </p>
            <div className="mt-6 flex justify-center">
              <StartButton size="lg" iconSize="size-5" className="px-12" />
            </div>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
