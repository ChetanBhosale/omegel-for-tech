import { NextRequest, NextResponse } from "next/server";
import { POSTS, getPost } from "@/lib/blog";
import { FAQ, SITE } from "@/lib/seo";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ markdownTwin: string[] }> }
) {
  const { markdownTwin } = await params;

  if (!markdownTwin || markdownTwin.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const segments = [...markdownTwin];
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment.endsWith(".md")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Strip .md extension
  segments[segments.length - 1] = lastSegment.slice(0, -3);

  let markdown = "";
  let title = "";

  let path = segments.join("/");
  if (path.startsWith("blog-twin/")) {
    path = "blog/" + path.slice(10);
  }

  if (path === "index" || path === "home" || path === "") {
    title = `${SITE.name} — ${SITE.tagline}`;
    markdown = `# ${title}

${SITE.description}

## Meet Tech People at random.

OmegleForTech is a random video chat for developers. Meet developers at random over 1-on-1 video, sign in with GitHub, get matched in seconds, and talk shop with real builders. No bots, no creeps, no signup forms.

## Questions, answered

${FAQ.map((item) => `### ${item.q}\n${item.a}`).join("\n\n")}
`;
  } else if (path === "omegle-alternative-for-developers") {
    title = "Omegle Alternative for Developers: Meet Real Builders";
    markdown = `# ${title}

An Omegle alternative for developers. OmegleForTech pairs you with real builders over 1-on-1 video. Sign in with GitHub and start matching in seconds.

## Omegle is gone. The need it filled is not.
When Omegle shut down in November 2023, it left millions of people without the one thing it did well: drop you into a conversation with someone new, instantly, with zero setup. People still search for that experience every single day.

The replacements that showed up mostly copied the old model exactly, including the part that made it unusable. Open the page, point your camera at nothing, and start skipping. If you are a developer, that is not worth your time.

## A room that is actually full of developers
OmegleForTech only lets you in through GitHub sign in. That single requirement changes everything about who you end up talking to. Instead of the entire internet, you get other people who write code for a living or for fun.

Every match starts with shared context. The language you are learning, the framework you are fighting with, the interview you are prepping for. You skip the awkward 'so what do you do' part because you already know.

## Same instant format, none of the chaos
Press start and you are connected to another developer in seconds. Want to move on? One click and you get someone new. It keeps the spontaneity that made the original fun.

The difference is the floor under it. Sign in keeps out the throwaway anonymity that made old random chat a moderation nightmare, and calls run peer to peer over WebRTC so your video goes straight to your match.

## What developers use it for
Pair on a bug you have been stuck on. Get a quick gut check on an architecture decision. Practice explaining your work out loud before a real interview. Meet someone building in the same corner of the industry as you. Or just talk to another human who understands what your day looks like.

## Questions, answered

${FAQ.map((item) => `### ${item.q}\n${item.a}`).join("\n\n")}
`;
  } else if (path === "blog") {
    title = "Developer Video Chat Blog: Tips, Stories & Updates";
    const postsList = [...POSTS]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(
        (post) => `### ${post.title}
- Date: ${formatDate(post.date)}
- Reading time: ${post.readingMinutes} min read
- Description: ${post.description}
- Link: /blog/${post.slug}`
      )
      .join("\n\n");

    markdown = `# ${title}

Read our latest articles on random video chat safety, developer networking tips, and behind-the-scenes stories of building the ultimate Omegle alternative.

## Articles

${postsList}
`;
  } else if (path.startsWith("blog/")) {
    const slug = path.slice(5);
    const post = getPost(slug);
    if (!post) {
      return new NextResponse("Not Found", { status: 404 });
    }

    title = post.title;
    const sectionsContent = post.sections
      .map((section) => {
        const heading = section.heading ? `## ${section.heading}\n` : "";
        const paragraphs = section.paragraphs.join("\n\n");
        return `${heading}${paragraphs}`;
      })
      .join("\n\n");

    markdown = `# ${title}

${post.description}

- Date: ${formatDate(post.date)}
- Reading time: ${post.readingMinutes} min read
- Tags: ${post.tags.join(", ")}

${sectionsContent}
`;
  } else if (path === "match") {
    title = "OmegleForTech Match";
    markdown = `# ${title}

The random video chat interface for developers.

This is the video chat interface. Sign in with GitHub to start matching with other developers.
`;
  } else {
    return new NextResponse("Not Found", { status: 404 });
  }

  const tokenCount = Math.ceil(markdown.length / 4);

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Vary": "Accept",
      "X-Markdown-Tokens": String(tokenCount),
      "X-Content-Type-Options": "nosniff",
      "X-AEO-Version": "1.0",
    },
  });
}
