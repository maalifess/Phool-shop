import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import { Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { loadFundraisers } from "@/lib/supabaseFundraisers";
import { loadProducts } from "@/lib/supabaseProducts";
import type { Fundraiser } from "@/lib/supabaseTypes";
import type { Product } from "@/lib/supabaseProducts";

type FundraiserUi = {
  id: Fundraiser["id"];
  title: string;
  description: string;
  image?: string;
  raised: number;
  goal: number;
};

const Fundraisers = () => {
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      const [f, p] = await Promise.all([loadFundraisers(), loadProducts()]);
      setFundraisers(f);
      setProducts(p);
    })();
  }, []);

  const isImageUrl = (v?: string) => {
    if (!v) return false;
    return v.startsWith("data:image/") || v.startsWith("http://") || v.startsWith("https://");
  };

  const toNumber = (v: unknown) => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const n = Number(v.replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n)) return n;
    }
    return 0;
  };

  const normalized: FundraiserUi[] = fundraisers.map((f) => {
    const raised = toNumber((f as any).raised);
    const goal = typeof (f as any).goal_pkr === "number" ? (f as any).goal_pkr : toNumber((f as any).goal);
    return {
      id: f.id,
      title: String((f as any).title ?? ""),
      description: String((f as any).description ?? ""),
      image: (f as any).image ? String((f as any).image) : undefined,
      raised,
      goal,
    };
  });

  return (
    <Layout>
      <PageHero scriptTitle="our" title="FUNDRAISERS" subtitle="Crocheting kindness into the world, one stitch at a time" />

      <section className="container mx-auto px-4 py-16">
        {normalized.length === 0 ? (
          <div className="retro-card bg-card p-10 text-center">
            <Heart className="mx-auto h-16 w-16 text-secondary" />
            <p className="font-script text-4xl text-secondary mt-4">Coming soon</p>
            <p className="text-muted-foreground mt-2">No fundraisers are currently active. Check back soon!</p>
            <Link to="/catalog" className="pill-btn-primary text-xs mt-6 inline-block">Shop Regular Items</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {normalized.map((fund, i) => {
              const pct = fund.goal > 0 ? Math.min((fund.raised / fund.goal) * 100, 100) : 0;
              return (
                <motion.div
                  key={fund.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="retro-card bg-card flex flex-col"
                >
                  <div className="aspect-video bg-blush flex items-center justify-center overflow-hidden">
                    {fund.image && isImageUrl(fund.image) ? (
                      <img src={fund.image} alt={fund.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Heart className="w-16 h-16 text-secondary" />
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-heading text-xl text-foreground">{fund.title}</h3>
                    <p className="text-muted-foreground text-sm mt-2 flex-1">{fund.description}</p>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm font-heading mb-2">
                        <span>PKR {fund.raised.toLocaleString()}</span>
                        <span className="text-muted-foreground">/ PKR {fund.goal.toLocaleString()}</span>
                      </div>
                      <Progress value={pct} className="h-3 rounded-full border-2 border-foreground" />
                    </div>

                    <div className="mt-6 flex gap-2">
                      <Link to={`/fundraiser/${fund.id}`} className="pill-btn-primary text-xs flex-1 justify-center">VIEW</Link>
                      <Link to={`/fundraiser/${fund.id}#donate`} className="pill-btn-golden text-xs flex-1 justify-center gap-2">
                        <Heart className="w-3 h-3" /> DONATE
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Fundraisers;
