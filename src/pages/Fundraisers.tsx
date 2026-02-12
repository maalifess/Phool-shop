import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Target } from "lucide-react";

const mockFundraisers = [
  {
    id: 1,
    title: "Crochet for Kids",
    description: "Handmade blankets and stuffed animals for children in shelters. Every purchase goes directly to creating warm, cozy items for kids in need.",
    goal: "$500",
    active: true,
    image: "🧶",
  },
  {
    id: 2,
    title: "Community Craft Workshop",
    description: "Help us fund free crochet workshops for the community. Learn to crochet and take home your own handmade creation.",
    goal: "$300",
    active: true,
    image: "🎨",
  },
  {
    id: 3,
    title: "Holiday Gift Drive",
    description: "Last year we delivered 200+ handmade gifts. This campaign helped bring smiles to families during the holiday season.",
    goal: "$750 (reached!)",
    active: false,
    image: "🎁",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Fundraisers = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Heart className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 font-display text-4xl font-bold text-foreground md:text-5xl">Fundraisers</h1>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              We use our craft to give back. Check out our active campaigns and past initiatives.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            className="mt-14 space-y-6"
          >
            {mockFundraisers.map((f, i) => (
              <motion.div key={f.id} variants={fadeUp} custom={i}>
                <Card className={`border-border/40 ${!f.active ? "opacity-70" : ""}`}>
                  <CardContent className="flex gap-6 p-6">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
                      {f.image}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                        {f.active && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <Target className="h-4 w-4" /> Goal: {f.goal}
                        </span>
                        {f.active && (
                          <Button size="sm" className="rounded-full">
                            Participate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Fundraisers;
