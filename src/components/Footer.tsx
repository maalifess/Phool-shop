import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-secondary">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground">Phool Shop</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Handcrafted crochet pieces made with love. Each item is unique and created with care.
            </p>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground">Quick Links</h4>
            <nav className="mt-3 flex flex-col gap-2">
              {[
                { to: "/catalog", label: "Catalog" },
                { to: "/custom-orders", label: "Custom Orders" },
                { to: "/fundraisers", label: "Fundraisers" },
                { to: "/order", label: "Place an Order" },
                { to: "/track-order", label: "Track Order" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-body text-sm font-semibold uppercase tracking-wider text-foreground">Contact</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <p>phoolshop@email.com</p>
              <p>Follow us on Instagram</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-1 border-t border-border/40 pt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div>Made with <Heart className="h-3 w-3 fill-primary text-primary" /> by Phool Shop</div>
                  <div>
                    <a href="/admin-login" className="rounded-md bg-transparent px-3 py-1 text-sm text-muted-foreground underline">Admin login</a>
                  </div>
                </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
