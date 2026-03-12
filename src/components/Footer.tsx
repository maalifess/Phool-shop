import { motion } from "framer-motion";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");

  return (
    <footer id="contact" className="bg-secondary text-primary-foreground relative overflow-hidden section-border-top">
      <div className="container mx-auto px-8 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase mb-12 leading-tight"
        >
          THANKS FOR<br />SHOPPING WITH US!
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
          <div className="border-[2px] border-golden rounded-2xl p-8">
            <div className="space-y-3 font-body text-sm">
              <p>{import.meta.env.VITE_SHOP_CONTACT_EMAIL || "hello@phoolshop.com"}</p>
              <p>WA {import.meta.env.VITE_SHOP_CONTACT_PHONE || "+92 300 0000000"}</p>
              <p>Handmade with love</p>
              <p className="font-heading text-xs uppercase tracking-wider mt-4">CUSTOM ORDERS WELCOME</p>
              <a href="/admin-login" className="inline-block font-heading text-xs uppercase tracking-wider underline">Admin login</a>
            </div>
          </div>

          <div className="border-[2px] border-golden rounded-2xl p-8">
            <p className="font-script text-3xl mb-4">Stay in the loop</p>
            <p className="font-body text-sm mb-6">Subscribe to our newsletter for new creations</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-transparent border-b-2 border-golden py-2 font-body text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none mb-4"
            />
            <label className="flex items-center gap-2 font-body text-xs cursor-pointer">
              <input type="checkbox" className="rounded border-golden" />
              I agree to the Privacy Policy
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mt-12">
          <img src="/Phoolshoplogo.png" alt="Phool Shop" className="h-16 w-16 opacity-80" />
          <a href="#" className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center font-heading text-sm hover:bg-primary-foreground/20 transition-colors">
            IG
          </a>
        </div>
      </div>

      <div className="bg-golden py-2 border-t-[3px] border-foreground overflow-hidden">
        <div className="marquee-track">
          <span className="font-heading text-sm text-foreground tracking-widest mx-8">
            LOOPED WITH LOVE 🌸 HANDMADE CROCHET 🧶 PHOOL SHOP 🌺 LOOPED WITH LOVE 🌸 HANDMADE CROCHET 🧶 PHOOL SHOP 🌺
          </span>
          <span className="font-heading text-sm text-foreground tracking-widest mx-8">
            LOOPED WITH LOVE 🌸 HANDMADE CROCHET 🧶 PHOOL SHOP 🌺 LOOPED WITH LOVE 🌸 HANDMADE CROCHET 🧶 PHOOL SHOP 🌺
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
