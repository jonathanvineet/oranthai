import { branches, company } from "./site";

// Structured data built only from company facts in site.ts.
// Branch street addresses were not provided, so branches list their locality only.
export function buildJsonLd() {
  const phone = (p: string) => `+91 ${p}`;
  const store = (b: (typeof branches)[number]) => ({
    "@type": ["LocalBusiness", "Store"],
    name: `${company.brand} ${b.name}${b.headOffice ? " (Head office)" : ""}`,
    ...(b.headOffice ? { description: `Head office of ${company.brand}.` } : {}),
    parentOrganization: { "@id": "#org" },
    telephone: phone(company.phones[0]),
    email: company.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: b.region === "Chennai" ? `${b.name}, Chennai` : b.name,
      addressRegion: "Tamil Nadu",
      addressCountry: "IN",
    },
  });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "#org",
        name: company.brand,
        legalName: company.legalName,
        brand: { "@type": "Brand", name: company.brand },
        email: company.email,
        telephone: company.phones.map(phone),
        taxID: company.gst,
        logo: "/favicon.png",
        address: {
          "@type": "PostalAddress",
          streetAddress: company.office.street,
          addressLocality: company.office.locality,
          postalCode: company.office.postalCode,
          addressRegion: "Tamil Nadu",
          addressCountry: "IN",
        },
      },
      ...branches.map(store),
    ],
  };
}
