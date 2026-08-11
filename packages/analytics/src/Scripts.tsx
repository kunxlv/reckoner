interface AnalyticsScriptsProps {
  ga4Id?: string;
  plausibleDomain?: string;
}

/** Server component — renders analytics script tags. Add to root layout. */
export function AnalyticsScripts({ ga4Id, plausibleDomain }: AnalyticsScriptsProps) {
  return (
    <>
      {ga4Id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${ga4Id}');`,
            }}
          />
        </>
      )}
      {plausibleDomain && (
        <script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
        />
      )}
    </>
  );
}
