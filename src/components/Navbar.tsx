import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { loadProducts } from "@/lib/supabaseProducts";
import { loadCards } from "@/lib/supabaseCards";
import type { Product } from "@/lib/supabaseProducts";
import type { Card as SupabaseCard } from "@/lib/supabaseTypes";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/catalog", label: "Catalog" },
  { to: "/custom-orders", label: "Custom Orders" },
  { to: "/fundraisers", label: "Fundraisers" },
  { to: "/tokri", label: "Tokri" },
];

const isImageUrl = (v?: string) => {
  if (!v || v.trim() === "") return false;
  return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allItems, setAllItems] = useState<(Product | SupabaseCard)[]>([]);
  const [suggestions, setSuggestions] = useState<(Product | SupabaseCard)[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  // Load products and cards once for search suggestions
  useEffect(() => {
    (async () => {
      const [prods, crds] = await Promise.all([loadProducts(), loadCards()]);
      setAllItems([...prods, ...crds]);
    })();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    const q = searchQuery.toLowerCase().trim();
    if (q.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const matches = allItems
      .filter((item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
      .slice(0, 5);
    setSuggestions(matches);
    setShowDropdown(matches.length > 0);
  }, [searchQuery, allItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/catalog?search=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
    setShowDropdown(false);
  };

  const goToProduct = (id: number) => {
    navigate(`/product/${id}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
    setShowDropdown(false);
  };

  const getFirstImage = (item: Product | SupabaseCard) => {
    const imgs = typeof item.images === "string"
      ? (() => { try { return JSON.parse(item.images || "[]"); } catch { return []; } })()
      : item.images || [];
    return imgs.find((v: string) => isImageUrl(v)) || "";
  };

  const SearchDropdown = () => {
    if (!showDropdown || suggestions.length === 0) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border/60 bg-background/98 shadow-xl backdrop-blur-xl z-[60] overflow-hidden">
        {suggestions.map((item) => {
          const img = getFirstImage(item);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goToProduct(item.id)}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 transition-colors"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {img ? (
                  <img src={img} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">N/A</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.category} • PKR {item.price}</div>
              </div>
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleSearch}
          className="flex w-full items-center justify-center gap-2 border-t border-border/40 px-3 py-2 text-xs font-medium text-primary hover:bg-accent/30 transition-colors"
        >
          <Search className="h-3 w-3" /> View all results for "{searchQuery}"
        </button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-foreground hover:scale-110 transition-transform duration-300 inline-block">
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

          {/* Desktop search */}
          {searchOpen ? (
            <div className="relative ml-2" ref={dropdownRef}>
              <form onSubmit={handleSearch} className="flex items-center gap-1">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="h-9 w-52 rounded-full border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                />
                <Button type="submit" variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Search className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => { setSearchOpen(false); setSearchQuery(""); setShowDropdown(false); }}>
                  <X className="h-4 w-4" />
                </Button>
              </form>
              <SearchDropdown />
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="ml-1 h-9 w-9 rounded-full" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="relative" ref={!dropdownRef.current ? dropdownRef : undefined}>
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="h-10 flex-1 rounded-full border border-border/60 bg-background px-4 text-sm outline-none focus:border-primary"
              />
              <Button type="submit" size="sm" className="rounded-full">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <SearchDropdown />
          </div>
        </div>
      )}

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
