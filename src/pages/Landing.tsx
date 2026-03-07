import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { RoleHierarchy } from "@/components/landing/RoleHierarchy";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { StatsCounter } from "@/components/landing/StatsCounter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustBadges />
      <StatsCounter />
      <FeaturesGrid />
      <FeatureShowcase />
      <RoleHierarchy />
      <TestimonialsSection />
      <PricingSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
