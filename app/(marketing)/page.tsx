import { CodeSection } from "@/components/marketing/code-section";
import { CTASection } from "@/components/marketing/cta-section";
import { DeveloperExperience } from "@/components/marketing/developer-experience";
import { DocsSection } from "@/components/marketing/docs-section";
import { EnterpriseSection } from "@/components/marketing/enterprise-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { IntegrationsSection } from "@/components/marketing/integrations-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ProblemSolution } from "@/components/marketing/problem-solution";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { VerticalsSection } from "@/components/marketing/verticals-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <ProblemSolution />
      <HowItWorks />
      <VerticalsSection />
      <FeaturesSection />
      <DeveloperExperience />
      <CodeSection />
      <TestimonialsSection />
      <IntegrationsSection />
      <DocsSection />
      <PricingSection />
      <EnterpriseSection />
      <CTASection />
    </>
  );
}
