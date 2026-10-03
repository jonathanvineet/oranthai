import { ClientShell } from "../ClientShell";
import { Nav } from "../sections/Nav";
import { Hero } from "../sections/Hero";
import { Quote } from "../sections/Quote";
import { Stores } from "../sections/Stores";
import { Products } from "../sections/Products";
import { CustomOrders } from "../sections/CustomOrders";
import { TrustedBy } from "../sections/TrustedBy";
import { TopBrands } from "../sections/TopBrands";
import { ContactFooter } from "../sections/ContactFooter";

// Prerendered at build time. Quote, Trusted by, Top brands, the footer and the nav are Server
// Components (static HTML plus tiny animation leaves); the other sections are client components.
export default function Page() {
  return (
    <ClientShell>
      <Nav />
      <main id="main">
        <Hero />
        <Quote />
        <Stores />
        <Products />
        <CustomOrders />
        <TrustedBy />
        <TopBrands />
      </main>
      <ContactFooter />
    </ClientShell>
  );
}
