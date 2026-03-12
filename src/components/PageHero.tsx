import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  scriptTitle?: string;
}

const PageHero = ({ title, subtitle, scriptTitle }: PageHeroProps) => (
  <section className="relative bg-seashell section-border-bottom overflow-hidden py-20 md:py-28">
    <div className="polka-dots absolute inset-0 opacity-30" />
    <div className="container mx-auto px-4 relative z-10 text-center">
      {scriptTitle && (
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-script text-5xl md:text-6xl text-secondary mb-2"
        >
          {scriptTitle}
        </motion.p>
      )}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="font-heading text-4xl md:text-6xl lg:text-7xl text-foreground uppercase"
      >
        {title}
      </motion.h1>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto font-body"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  </section>
);

export default PageHero;
