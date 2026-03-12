import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import { MouseTrail } from "@/components/MouseTrail";
import { loadFundraisers } from "@/lib/supabaseFundraisers";
import { loadProducts } from "@/lib/supabaseProducts";
import type { Fundraiser } from "@/lib/supabaseTypes";
import type { Product } from "@/lib/supabaseProducts";

const Fundraisers = () => {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Scroll-based navbar hiding
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        setNavVisible(false);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    (async () => {
      const [f, p] = await Promise.all([loadFundraisers(), loadProducts()]);
      setFundraisers(f);
      setProducts(p);
    })();
  }, []);

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  return (
    <Layout hideNavbar hideFooter>
      <MouseTrail />
      <div className="min-h-screen" style={{ backgroundColor: '#FFF5EE' }}>
        {/* Desktop Navigation */}
        <div className={`hidden lg:flex left-1/2 -translate-x-1/2 w-[93vw] lg:max-w-[1280px] fixed top-10 z-50 h-min transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="flex items-center justify-between w-full gap-6">
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Home</Link>
              <Link to="/custom-orders" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Custom Orders</Link>
              <Link to="/catalog" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Shop</Link>
            </div>
            <div className="w-full flex items-center justify-center">
              <Link to="/" className="text-3xl font-bold tracking-tight" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center justify-center gap-2 border-2 rounded-full px-4 py-2.5 w-full" style={{ backgroundColor: '#FFF5EE', borderColor: '#442f2a' }}>
              <Link to="/fundraisers" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Fundraisers</Link>
              <Link to="/tokri" className="border-2 rounded-full px-4 pt-1.5 text-lg transition-colors duration-200 whitespace-nowrap" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>Tokri</Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden fixed w-full top-0 left-0 right-0 z-50 bg-transparent p-4 transition-transform duration-500 ${navVisible ? 'translate-y-0' : '-translate-y-[200%]'}`}>
          <div className="relative w-full flex items-center">
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 border-2 rounded-full" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
              <span className="text-xl">≡</span>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex-shrink-0">
              <Link to="/" className="text-xl font-bold" style={{ color: '#442f2a', fontFamily: '"Fredoka One", cursive' }}>Phool</Link>
            </div>
            <div className="flex items-center gap-3 ml-auto flex-shrink-0">
              <Link to="/tokri" className="w-14 h-14 flex items-center justify-center border-2 rounded-full text-xs font-bold" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>Tokri</Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="pt-[5dvh] md:pt-0">
          <div className="xl:max-w-[1360px] mx-auto">
            <div className="w-full flex items-center justify-center relative">
              <div className="border-2 border-[#442f2a] lg:w-[95vw] w-[90vw] min-h-[50dvh] md:min-h-[60dvh] overflow-hidden mt-[8dvh] md:mt-[2dvh] px-6 md:px-8 grid place-items-center" style={{ borderRadius: '3.5rem 3.5rem 0 0', backgroundColor: '#EFD8D6' }}>
                <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center justify-center gap-6 py-12">
                  <h1 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive', color: '#FFF5EE' }}>
                    Fundraisers
                  </h1>
                  <p className="max-w-[44ch] text-base md:text-lg text-center" style={{ color: '#442f2a' }}>
                    Support causes that matter, one crochet at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fundraisers Section */}
        <div className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-16 md:py-20">
            <div className="max-w-[1080px] flex flex-col items-center justify-center gap-10 px-4 mx-auto">
              <div className="w-full flex items-center justify-between gap-6 mt-16">
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h2 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive' }}>
                  {fundraisers.length === 0 ? 'Coming' : 'Active'}
                </h2>
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6 rotate-180" />
                </div>
              </div>

              <div className="w-full max-w-4xl">
                {fundraisers.length === 0 ? (
                  <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                    <div className="p-8 text-center">
                      <Heart className="mx-auto h-16 w-16 mb-6" style={{ color: '#442f2a' }} />
                      <p className="text-base md:text-lg mb-6" style={{ color: '#442f2a' }}>
                        No fundraisers are currently active. Check back soon!
                      </p>
                      <Button asChild className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                        <Link to="/catalog">Shop Regular Items</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fundraisers.map((fundraiser) => (
                      <div key={fundraiser.id} className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                        <div className="aspect-[4/3] bg-[#EFD8D6] relative overflow-hidden">
                          {fundraiser.image && isImageUrl(fundraiser.image) ? (
                            <img src={fundraiser.image} alt={fundraiser.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center" style={{ color: '#442f2a' }}>
                              <Heart className="h-16 w-16" />
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-2" style={{ color: '#442f2a' }}>{fundraiser.title}</h3>
                          <p className="text-base mb-4" style={{ color: '#BC8F8F' }}>{fundraiser.description}</p>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span style={{ color: '#442f2a' }}>Progress</span>
                              <span style={{ color: '#442f2a' }}>{fundraiser.raised || 0} / {fundraiser.goal || 0}</span>
                            </div>
                            <div className="w-full bg-[#EFD8D6] rounded-full h-3">
                              <div 
                                className="h-3 rounded-full transition-all duration-300" 
                                style={{ 
                                  width: `${Math.min(((fundraiser.raised || 0) / (fundraiser.goal || 1)) * 100, 100)}%`,
                                  backgroundColor: '#BC8F8F'
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button asChild className="rounded-full px-4 border-2 flex-1" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                              <Link to={`/fundraiser/${fundraiser.id}`}>View Details</Link>
                            </Button>
                            <Button variant="outline" className="rounded-full px-4 border-2 flex-1" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>
                              <Link to={`/fundraiser/${fundraiser.id}#donate`}>Donate</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Fundraisers;
