import { BackgroundVideo } from "@/components/landing/background-video";
import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { AppJsonLd } from "@/components/seo/json-ld";

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export default function Page() {
  return (
    <>
      <AppJsonLd />

      <div className="relative min-h-svh overflow-hidden bg-background">
        <BackgroundVideo src={VIDEO_SRC} />
        <LandingNav />
        <Hero />
      </div>
    </>
  );
}
