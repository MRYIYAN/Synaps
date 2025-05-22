import React, { useEffect } from "react";
import NavbarLanding from "../components/Landing/NavbarLanding";
import ParticlesBackground from '../components/Landing/ParticlesBackground';
import HeroSection from "../components/Landing/HeroSection";
import FeatureSection from "../components/Landing/FeatureSection";
import SolutionsShowcase from "../components/Landing/SolutionsShowcase";
import CommunitySection from "../components/Landing/CommunitySection";
import TestimonialSection from "../components/Landing/TestimonialSection";
import CTASection from "../components/Landing/CTASection";
import Footer from "../components/Landing/Footer";
import SectionDivider from '../components/Landing/SectionDivider';
import PageTransition from '../components/Transitions/PageTransition';
import "../styles/landing.css";
import "../styles/animations.css";

const LandingPage = function() {
  // Efecto para scroll suave
  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        document.querySelector(targetId)?.scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
  }, []);
  
  return (
    <>
      {/* ParticlesBackground siempre visible */}
      <ParticlesBackground />
      
      {/* PageTransition sin delay */}
      <PageTransition delay={0}>
        <div className="landing-page">
          <NavbarLanding />
          <HeroSection />
          <SectionDivider />
          <FeatureSection />
          <SectionDivider variant="accent" />
          <SolutionsShowcase />
          <SectionDivider />
          <CommunitySection />
          <SectionDivider variant="accent" />
          <TestimonialSection />
          <SectionDivider />
          <CTASection />
          <Footer />
        </div>
      </PageTransition>
    </>
  );
};

export default LandingPage;
