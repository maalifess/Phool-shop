import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary text-primary-foreground relative overflow-hidden section-border-top">
      <div className="container mx-auto px-8 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-heading text-4xl md:text-6xl lg:text-7xl uppercase mb-12 leading-tight text-center"
        >
          aapke taawan ka<br />shukariya
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h3 className="font-heading text-2xl md:text-3xl text-primary-foreground">Reach us out &lt;3</h3>
          
          <div className="space-y-2 font-body text-base">
            <p>phoolshopstore@gmail.com</p>
            <p>+92 321 0000000</p>
            <a href="https://www.instagram.com/phoolshopp/" target="_blank" rel="noopener noreferrer" className="underline hover:text-golden transition-colors">@phoolshopp</a>
          </div>
          
          <div className="space-y-3 pt-4">
            <Link 
              to="/track-order" 
              className="inline-block pill-btn-outline text-sm"
            >
              Track Your Order
            </Link>
            <br />
            <a href="/admin-login" className="inline-block font-heading text-xs uppercase tracking-wider underline hover:text-golden transition-colors">Admin login</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
