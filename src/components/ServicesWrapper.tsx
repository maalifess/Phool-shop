import CustomServicesSection from "./CustomServicesSection";
import DeliveryServicesSection from "./DeliveryServicesSection";

const ServicesWrapper = () => {
  return (
    <section id="services" className="relative overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full">
        <CustomServicesSection />
        <DeliveryServicesSection />
      </div>
    </section>
  );
};

export default ServicesWrapper;
