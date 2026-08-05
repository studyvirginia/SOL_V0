import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Warm up the connection to GeoGebra's CDN as early as possible so
            the deployggb.js script (loaded afterInteractive) has less latency. */}
        <link rel="preconnect" href="https://www.geogebra.org" />
        <link rel="dns-prefetch" href="https://www.geogebra.org" />

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon-16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
