import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Warm up the connection to GeoGebra's CDN as early as possible so
            the deployggb.js script (loaded afterInteractive) has less latency. */}
        <link rel="preconnect" href="https://www.geogebra.org" />
        <link rel="dns-prefetch" href="https://www.geogebra.org" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
