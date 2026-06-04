import { CodeSection } from "@/components/marketing/code-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { IntegrationsSection } from "@/components/marketing/integrations-section";
import { ScrollReveal } from "@/components/marketing/scroll-reveal";
import { VerticalsSection } from "@/components/marketing/verticals-section";

/**
 * Marketing home — the hero handles its own intro animation; every section
 * after it is wrapped in <ScrollReveal> so the page reads as a single
 * choreographed scroll experience instead of a static stack.
 */
export default function HomePage() {
  return (
    <>
      <HeroSection />

      <ScrollReveal>
        <IntegrationsSection />
      </ScrollReveal>

      <ScrollReveal>
        <FeaturesSection />
      </ScrollReveal>

      <ScrollReveal>
        <CodeSection />
      </ScrollReveal>

      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>

      <ScrollReveal>
        <VerticalsSection />
      </ScrollReveal>

      <ScrollReveal>
        <CTASection />
      </ScrollReveal>
    </>
  );
}
