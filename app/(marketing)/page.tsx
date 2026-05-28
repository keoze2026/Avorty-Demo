import { CodeSection } from "@/components/marketing/code-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { IntegrationsSection } from "@/components/marketing/integrations-section";
import { VerticalsSection } from "@/components/marketing/verticals-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntegrationsSection />
      <FeaturesSection />
      <CodeSection />
      <HowItWorks />
      <VerticalsSection />
      <CTASection />
    </>
  );
}
