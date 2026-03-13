import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/lib/cart";

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="sticky top-0 z-50 bg-background border-b-[3px] border-foreground"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left navigation */}
          <div className="flex gap-2">
            <Link to="/catalog" className="pill-btn-primary text-xs">SHOP</Link>
            <Link to="/custom-orders" className="pill-btn-primary text-xs">CUSTOM</Link>
            <Link to="/fundraisers" className="pill-btn-primary text-xs hidden md:inline-flex">FUNDRAISERS</Link>
          </div>

          {/* Center logo */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link to="/" className="flex-shrink-0">
              <div className="text-4xl">🌸</div>
            </Link>
          </div>

          {/* Right cart */}
          <div className="flex gap-2 items-center">
            <Link to="/tokri" className="pill-btn-outline p-3 relative">
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-golden text-foreground text-[10px] font-heading rounded-full flex items-center justify-center border border-foreground">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
