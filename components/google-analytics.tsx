import { connection } from "next/server";
import Script from "next/script";

function measurementId() {
  const raw = process.env.GA_MEASUREMENT_ID ?? "";
  return raw.match(/G-[A-Z0-9]+/i)?.[0] ?? "";
}

export async function GoogleAnalytics() {
  await connection();
  const id = measurementId();
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
