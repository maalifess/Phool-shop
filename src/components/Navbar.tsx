import { motion } from "framer-motion";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart";
import { useState } from "react";

const Navbar = () => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-background border-b-[3px] border-foreground"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between relative">
          {/* Left - Mobile menu button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-foreground hover:bg-golden transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex gap-2">
              <Link to="/catalog" className="pill-btn-primary text-xs">SHOP</Link>
              <Link to="/custom-orders" className="pill-btn-primary text-xs">CUSTOM</Link>
              <Link to="/fundraisers" className="pill-btn-primary text-xs">FUNDRAISERS</Link>
              <Link to="/track-order" className="pill-btn-outline text-xs">TRACK</Link>
            </div>
          </div>

          {/* Center logo - positioned absolutely on desktop */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:block hidden">
            <Link to="/" className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full border-2 border-foreground flex items-center justify-center bg-card">
                <span className="font-heading text-sm text-foreground">PHOOL</span>
              </div>
            </Link>
          </div>

          {/* Mobile logo - positioned normally on mobile */}
          <div className="md:hidden">
            <Link to="/" className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full border-2 border-foreground flex items-center justify-center bg-card">
                <span className="font-heading text-xs text-foreground">PHOOL</span>
              </div>
            </Link>
          </div>

          {/* Right cart - with margin to account for centered logo on desktop */}
          <div className="flex gap-2 items-center md:ml-auto">
            <Link to="/tokri" className="pill-btn-outline p-2 md:p-3 relative">
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-golden text-foreground text-[8px] md:text-[10px] font-heading rounded-full flex items-center justify-center border border-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-foreground"
          >
            <div className="flex flex-col gap-2">
              <Link 
                to="/catalog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="pill-btn-primary text-xs text-left w-full"
              >
                SHOP
              </Link>
              <Link 
                to="/custom-orders" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="pill-btn-primary text-xs text-left w-full"
              >
                CUSTOM
              </Link>
              <Link 
                to="/fundraisers" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="pill-btn-primary text-xs text-left w-full"
              >
                FUNDRAISERS
              </Link>
              <Link 
                to="/track-order" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="pill-btn-outline text-xs text-left w-full"
              >
                TRACK
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
