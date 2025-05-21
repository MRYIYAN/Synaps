import React from "react";
import NavbarLanding from "../components/Landing/NavbarLanding";
import ParticlesBackground from "../components/Landing/ParticlesBackground";
import HeroSection from "../components/Landing/HeroSection";
import FeatureSection from "../components/Landing/FeatureSection";
import SolutionsShowcase from "../components/Landing/SolutionsShowcase";
import CommunitySection from "../components/Landing/CommunitySection"; // Nueva importación
import TestimonialSection from "../components/Landing/TestimonialSection";
import CTASection from "../components/Landing/CTASection";
import Footer from "../components/Landing/Footer";
import "../styles/landing.css";

const LandingPage = function() {
  return (
    <div className="landing-page">
      <ParticlesBackground />
      <NavbarLanding />
      <HeroSection />
      <FeatureSection />
      <SolutionsShowcase />
      <CommunitySection /> {/* Nueva sección */}
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
