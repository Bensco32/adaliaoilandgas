import { loadSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site";

function jsonLd(value: unknown): string {
  // JSON.stringify escapes quotes and backslashes; additionally neutralise
  // "</script" sequences that could break out of the script tag and escapes
  // all "<" characters for extra safety.
  return JSON.stringify(value).replace(/</g, "\\u003C");
}

export function SeoStructuredData() {
  const company = loadSettings().company;
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: company.website || SITE_URL,
            identifier: company.rcNumber || undefined,
            description: company.about.slice(0, 500),
            ...(company.addressRequiresVerification ? {} : {
              address: { "@type": "PostalAddress", addressCountry: "NG", postalCode: "" }
            }),
            sameAs: [company.social.whatsapp, company.social.instagram, company.social.facebook].filter(Boolean)
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: company.name,
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            },
            publisher: { "@id": SITE_URL + "#organization" }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@id": SITE_URL + "#organization",
            "@type": "Organization",
            name: company.name
          })
        }}
      />
    </>
  );
}
