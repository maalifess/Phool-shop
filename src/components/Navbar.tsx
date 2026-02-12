import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catalog" },
  { to: "/custom-orders", label: "Custom Orders" },
  { to: "/fundraisers", label: "Fundraisers" },
  { to: "/tokri", label: "Tokri" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Phool Shop
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                location.pathname === link.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {link.label}
                {link.to === "/tokri" && totalItems > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-2 text-xs font-medium text-primary">
                    {totalItems}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-accent ${
                  location.pathname === link.to ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {link.label}
                  {link.to === "/tokri" && totalItems > 0 && (
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-2 text-xs font-medium text-primary">
                      {totalItems}
                    </span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
