import { CTASection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Navbar } from "@/components/landing/navbar";

export default function MarketingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </main>
  );
}
