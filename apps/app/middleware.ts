import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignore static files, API routes, next internal files, and existing .md requests
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const accept = request.headers.get("accept") || "";
  const userAgent = request.headers.get("user-agent") || "";

  const isMarkdownPreferred = accept.includes("text/markdown");
  const isAIBot = /gptbot|chatgpt|claudebot|perplexity|cohere|google-extended|anthropic|applebot-extended|omgilibot/i.test(
    userAgent
  );

  let cleanPath = pathname;
  if (cleanPath.endsWith("/") && cleanPath !== "/") {
    cleanPath = cleanPath.slice(0, -1);
  }

  if (isMarkdownPreferred || isAIBot) {
    // Rewrite to the markdown twin
    let targetPath = cleanPath;
    if (cleanPath === "/") {
      targetPath = "/index.md";
    } else if (cleanPath.startsWith("/blog/")) {
      targetPath = `/blog-twin/${cleanPath.slice(6)}.md`;
    } else {
      targetPath = `${cleanPath}.md`;
    }

    const url = request.nextUrl.clone();
    url.pathname = targetPath;

    const response = NextResponse.rewrite(url);
    response.headers.set("Vary", "Accept");
    return response;
  }

  // For normal HTML requests, advertise the markdown twin via Link header
  let twinPath = cleanPath === "/" ? "/index.md" : `${cleanPath}.md`;
  const response = NextResponse.next();
  response.headers.set(
    "Link",
    `<${twinPath}>; rel="alternate"; type="text/markdown"`
  );
  response.headers.set("Vary", "Accept");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
