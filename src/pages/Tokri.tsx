import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { Minus, Plus, Trash, ArrowRight } from "lucide-react";
import { MouseTrail } from "@/components/MouseTrail";

const Tokri = () => {
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();
  const navigate = useNavigate();
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

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  const handleCheckout = () => {
    navigate("/order", { state: { items } });
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
                    Tokri
                  </h1>
                  <p className="max-w-[44ch] text-base md:text-lg text-center" style={{ color: '#442f2a' }}>
                    Your crochet treasures, waiting to go home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="xl:max-w-[1360px] mx-auto">
          <section className="w-full border-x-2 border-[#442f2a] bg-[#F7F3ED] text-[#442f2a] max-w-[90vw] md:max-w-[95vw] mx-auto relative py-16 md:py-20">
            <div className="max-w-[1080px] flex flex-col items-center justify-center gap-10 px-4 mx-auto">
              <div className="w-full flex items-center justify-between gap-6 mt-16">
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6" />
                </div>
                <h2 className="text-[4rem] md:text-[8rem] leading-[1] rotate-[-10deg]" style={{ fontFamily: '"Sacramento", cursive' }}>
                  {items.length === 0 ? 'Empty' : 'Cart'}
                </h2>
                <div className="hidden md:flex w-16 h-16 border-2 rounded-full items-center justify-center" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                  <ArrowRight className="h-6 w-6 rotate-180" />
                </div>
              </div>

              <div className="w-full max-w-3xl">
                {items.length === 0 ? (
                  <div className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                    <div className="p-8 text-center">
                      <p className="text-base md:text-lg mb-6" style={{ color: '#442f2a' }}>Your Tokri is empty.</p>
                      <Button asChild className="rounded-full px-6 border-2" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                        <Link to="/catalog">Browse Products</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((it) => (
                      <div key={`${it.id}-${it.customText ?? ""}`} className="border-2 rounded-[2rem] overflow-hidden" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                        <div className="p-6 flex items-center gap-6">
                          <div className="h-20 w-20 flex items-center justify-center rounded-xl" style={{ backgroundColor: '#EFD8D6' }}>
                            {isImageUrl(it.image) ? (
                              <img src={it.image} alt={it.name} className="h-full w-full rounded-xl object-cover" loading="lazy" />
                            ) : (
                              <span className="text-3xl">{it.image}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg" style={{ color: '#442f2a' }}>{it.name}</div>
                            <div className="text-sm mt-1" style={{ color: '#BC8F8F' }}>PKR {it.price} each</div>
                            {it.customText && (
                              <div className="text-sm mt-2" style={{ color: '#BC8F8F' }}>Custom: {it.customText}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(it.id, it.customText, Number(it.quantity) - 1)}
                              className="w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors duration-200"
                              style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-bold w-8 text-center" style={{ color: '#442f2a' }}>{it.quantity}</span>
                            <button
                              onClick={() => updateQuantity(it.id, it.customText, Number(it.quantity) + 1)}
                              className="w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors duration-200"
                              style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeItem(it.id, it.customText)}
                              className="w-8 h-8 border-2 rounded-full flex items-center justify-center transition-colors duration-200 ml-2"
                              style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-2 rounded-[2rem] overflow-hidden mt-6" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE' }}>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-xl font-bold" style={{ color: '#442f2a' }}>Total:</span>
                          <span className="text-xl font-bold" style={{ color: '#442f2a' }}>PKR {totalPrice}</span>
                        </div>
                        <div className="flex gap-4">
                          <Button onClick={clear} variant="outline" className="rounded-full px-6 border-2 flex-1" style={{ borderColor: '#442f2a', backgroundColor: '#FFF5EE', color: '#442f2a' }}>
                            Clear Cart
                          </Button>
                          <Button onClick={handleCheckout} className="rounded-full px-6 border-2 flex-1" style={{ borderColor: '#442f2a', backgroundColor: '#BC8F8F', color: '#FFF5EE' }}>
                            Checkout
                          </Button>
                        </div>
                      </div>
                    </div>
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

export default Tokri;
