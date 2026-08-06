import { NextResponse } from "next/server";

// solprep.com / www.solprep.com serve the SEO marketing site.
// Every other host (app.solprep.com, *.vercel.app previews, localhost)
// keeps hitting the real app unchanged.
const MARKETING_HOSTS = new Set(["solprep.com", "www.solprep.com"]);

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const hostname = host.split(":")[0];

  if (!MARKETING_HOSTS.has(hostname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (url.pathname === "/" || url.pathname === "") {
    url.pathname = "/marketing";
    return NextResponse.rewrite(url);
  }
  if (!url.pathname.startsWith("/marketing")) {
    url.pathname = `/marketing${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Anything under _next/*, /api/*, or a path with a file extension
  // (favicon.ico, robots.txt, sitemap.xml, icon PNGs, etc.) is served as-is,
  // regardless of host - only actual pages get the marketing rewrite.
  matcher: [
    "/((?!_next/static|_next/image|api|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
