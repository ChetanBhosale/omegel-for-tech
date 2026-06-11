import { SITE, FAQ, absoluteUrl } from "@/lib/seo";

/** Inline a JSON-LD script. Server rendered so crawlers see it in the HTML. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** WebApplication + Organization schema for the homepage. */
export function AppJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    url: SITE.domain,
    description: SITE.description,
    applicationCategory: "CommunicationApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires a browser with WebRTC support",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.domain,
    },
  };
  return <JsonLd data={data} />;
}

/** FAQPage schema. Pairs with the visible FAQ section for rich snippets. */
export function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
  return <JsonLd data={data} />;
}

/** Article schema for a blog post. */
export function ArticleJsonLd({
  title,
  description,
  slug,
  date,
}: {
  title: string;
  description: string;
  slug: string;
  date: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    url: absoluteUrl(`blog/${slug}`),
    author: { "@type": "Organization", name: SITE.name },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: absoluteUrl(`blog/${slug}`),
  };
  return <JsonLd data={data} />;
}

/** Dynamic FAQPage schema for blog posts with Q&A sections. */
export function BlogFaqJsonLd({
  sections,
}: {
  sections: { heading?: string; paragraphs: string[] }[];
}) {
  const qaSections = sections.filter(
    (s) =>
      s.heading &&
      (s.heading.endsWith("?") ||
        /^(why|how|what|is|can|where|who|are|do|does|should)\b/i.test(s.heading))
  );

  if (qaSections.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qaSections.map((s) => ({
      "@type": "Question",
      name: s.heading,
      acceptedAnswer: {
        "@type": "Answer",
        text: s.paragraphs.join(" "),
      },
    })),
  };

  return <JsonLd data={data} />;
}

/** BreadcrumbList schema. */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={data} />;
}

/** FAQPage schema for the blog index page. */
export function BlogIndexFaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best Omegle alternative for developers in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Omegle is gone and most replacements are still a coin flip with strangers. OmegleForTech is the best alternative because it requires a GitHub sign-in, ensuring you only match with other verified developers.",
        },
      },
      {
        "@type": "Question",
        name: "How do you network with developers online?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Instead of slow social media feeds, live video matching lets you connect face-to-face with other developers instantly. Leading with what you are working on and treating the skip button as a feature makes networking fast and effective.",
        },
      },
      {
        "@type": "Question",
        name: "Is random video chat safe?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Traditional anonymous video chat has safety risks, but requiring a GitHub sign-in raises the floor by removing total anonymity. Additionally, calls run peer-to-peer over WebRTC so streams are not recorded.",
        },
      },
      {
        "@type": "Question",
        name: "Why are developers moving to niche video chat rooms?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The modern web is noisy and generic platforms lack shared context. Niche video chat rooms introduce a single filter (like GitHub sign-in) so developers can have deep, technical conversations immediately.",
        },
      },
    ],
  };
  return <JsonLd data={data} />;
}

/** DefinedTerm schema. */
export function DefinedTermJsonLd({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name,
    description,
  };
  return <JsonLd data={data} />;
}
