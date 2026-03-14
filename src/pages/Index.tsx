import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MarqueeBanner from "@/components/MarqueeBanner";
import ShopSection from "@/components/ShopSection";
import StatementBanner from "@/components/StatementBanner";
import CustomServicesSection from "@/components/CustomServicesSection";
import DeliveryServicesSection from "@/components/DeliveryServicesSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MarqueeBanner />
      <ShopSection />
      <div className="flex flex-col lg:flex-row w-full">
        <CustomServicesSection />
        <DeliveryServicesSection />
      </div>
      <StatementBanner />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;

