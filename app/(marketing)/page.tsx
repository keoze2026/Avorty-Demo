import { CodeSection } from "@/components/marketing/code-section";
import { CTASection } from "@/components/marketing/cta-section";
import { DeveloperExperience } from "@/components/marketing/developer-experience";
import { DocsSection } from "@/components/marketing/docs-section";
import { EnterpriseSection } from "@/components/marketing/enterprise-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { StatsSection } from "@/components/marketing/stats-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DeveloperExperience />
      <CodeSection />
      <DocsSection />
      <PricingSection />
      <EnterpriseSection />
      <CTASection />
    </>
  );
}
