import { BackgroundVideo } from "@/components/landing/background-video";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { FaqSection } from "@/components/landing/faq-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { AppJsonLd, FaqJsonLd, DefinedTermJsonLd } from "@/components/seo/json-ld";
import { SITE } from "@/lib/seo";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export default function Page() {
  return (
    <>
      <AppJsonLd />
      <FaqJsonLd />
      <DefinedTermJsonLd
        name="OmegleForTech"
        description={SITE.description}
      />

      <div className="relative min-h-svh overflow-hidden bg-background">
        <BackgroundVideo src={VIDEO_SRC} />
        <header>
          <LandingNav />
        </header>
        <main>
          <Hero />
          <FaqSection />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
