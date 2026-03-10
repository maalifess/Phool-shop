import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/40" style={{backgroundColor: '#BC8F8F', color: '#FFF5EE'}}>
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-display text-xl font-medium" style={{color: '#FFF5EE'}}>Phool Shop</h3>
            <p className="mt-3 text-sm leading-relaxed" style={{color: '#FFF5EE'}}>
              Handcrafted crochet pieces made with love. Each item is unique and created with care.
            </p>
          </div>

          <div>
            <h4 className="font-body text-sm font-medium uppercase tracking-wider" style={{color: '#FFF5EE'}}>Quick Links</h4>
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
                  className="text-sm transition-colors"
                  style={{color: '#FFF5EE'}}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-body text-sm font-medium uppercase tracking-wider" style={{color: '#FFF5EE'}}>Contact</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm" style={{color: '#FFF5EE'}}>
              <p>phoolshop@email.com</p>
              <p>Follow us on Instagram</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-1 border-t border-border/40 pt-6 text-xs" style={{color: '#FFF5EE'}}>
                <div className="flex items-center gap-3">
                  <div>Made with <Heart className="h-3 w-3 fill-primary text-primary" /> by Phool Shop</div>
                  <div>
                    <a href="/admin-login" className="rounded-md bg-transparent px-3 py-1 text-sm underline" style={{color: '#FFF5EE'}}>Admin login</a>
                  </div>
                </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
