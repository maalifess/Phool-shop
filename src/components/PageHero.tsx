import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  scriptTitle?: string;
  scriptSubtitle?: string;
}

const PageHero = ({ title, subtitle, scriptTitle, scriptSubtitle }: PageHeroProps) => (
  <section className="relative bg-seashell section-border-bottom overflow-hidden py-12 md:py-16">
    <div className="polka-dots-sm absolute inset-0 opacity-20" />
    <div className="container mx-auto px-4 relative z-10 text-center">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
        {scriptTitle && (
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-script text-3xl md:text-5xl text-secondary"
          >
            {scriptTitle}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-heading text-3xl md:text-5xl lg:text-6xl text-foreground uppercase"
        >
          {title}
        </motion.h1>
        {scriptSubtitle && (
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="font-script text-3xl md:text-5xl text-secondary"
          >
            {scriptSubtitle}
          </motion.span>
        )}
      </div>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto font-body"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  </section>
);

export default PageHero;
