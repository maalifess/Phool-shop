import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import ShopSection from "@/components/ShopSection";
import StatementBanner from "@/components/StatementBanner";
import AboutSection from "@/components/AboutSection";
import ServicesSection from "@/components/ServicesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <ShopSection />
      <StatementBanner />
      <AboutSection />
      <ServicesSection />
      <MarqueeBanner />
      <Footer />
    </div>
  );
};

export default Index;
