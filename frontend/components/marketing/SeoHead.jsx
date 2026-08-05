import Head from "next/head";

const SITE_NAME = "SOL Prep";
const DEFAULT_TITLE = "SOL Prep — AI Study Assistant for Virginia SOL Exams";
const DEFAULT_DESCRIPTION =
  "SOL Prep is an AI-powered study assistant for Virginia Standards of Learning (SOL) exams — diagnostics, guided notes, flashcards, mnemonics, and practice questions built around what students actually get stuck on.";
const SITE_URL = "https://solprep.com";

export default function SeoHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noindex = false,
}) {
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
  );
}

export { SITE_NAME, SITE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION };
