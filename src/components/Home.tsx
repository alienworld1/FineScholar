import Header from './sections/Header';
import HeroSection from './sections/HeroSection';
import HowItWorksSection from './sections/HowItWorksSection';
import FeaturesSection from './sections/FeaturesSection';
import CTASection from './sections/CTASection';
import Footer from './sections/Footer';
import FloatingElements from './FloatingElements';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative overflow-hidden">
      <FloatingElements />

      <div className="relative z-10">
        <Header />
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
