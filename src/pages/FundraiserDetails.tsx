import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadFundraiserById } from "@/lib/supabaseFundraisers";
import { loadProductById } from "@/lib/supabaseProducts";
import type { Fundraiser } from "@/lib/supabaseTypes";
import type { Product } from "@/lib/supabaseProducts";

const FundraiserDetails = () => {
  const { id } = useParams();
  const fundraiserId = Number(id);

  const [fundraiser, setFundraiser] = useState<Fundraiser | null>(null);
  const [linkedProduct, setLinkedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const f = await (Number.isFinite(fundraiserId) ? loadFundraiserById(fundraiserId) : Promise.resolve(null));
      setFundraiser(f);

      if (f && typeof f.product_id === "number") {
        const p = await loadProductById(f.product_id);
        setLinkedProduct(p);
      } else {
        setLinkedProduct(null);
      }

      setLoading(false);
    })();
  }, [fundraiserId]);

  if (loading) {
    return (
      <Layout>
        <div className="container py-24 text-center text-muted-foreground">Loading fundraiser...</div>
      </Layout>
    );
  }

  if (!fundraiser) {
    return (
      <Layout>
        <div className="container py-24 text-center">Fundraiser not found.</div>
      </Layout>
    );
  }

  const goal = typeof fundraiser.goal_pkr === "number" ? `PKR ${fundraiser.goal_pkr}` : fundraiser.goal;
  const start = fundraiser.start_date ? new Date(fundraiser.start_date).toLocaleDateString() : "";
  const end = fundraiser.end_date ? new Date(fundraiser.end_date).toLocaleDateString() : "";
  const linkedProductResolved = linkedProduct ?? undefined;

  return (
    <Layout>
      <section className="py-16 md:py-24">
        <div className="container max-w-4xl">
          <Card className="border-border/40 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {fundraiser.image && (
                <div className="md:w-1/3">
                  <img 
                    src={fundraiser.image} 
                    alt={fundraiser.title} 
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">{fundraiser.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-muted-foreground">{fundraiser.description}</div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded border border-border/40 p-3">
                      <div className="text-xs text-muted-foreground">Goal</div>
                      <div className="font-semibold">{goal}</div>
                    </div>
                    <div className="rounded border border-border/40 p-3">
                      <div className="text-xs text-muted-foreground">Status</div>
                      <div className="font-semibold">{fundraiser.active ? "Active" : "Inactive"}</div>
                    </div>
                    {start && (
                      <div className="rounded border border-border/40 p-3">
                        <div className="text-xs text-muted-foreground">Start Date</div>
                        <div className="font-semibold">{start}</div>
                      </div>
                    )}
                    {end && (
                      <div className="rounded border border-border/40 p-3">
                        <div className="text-xs text-muted-foreground">End Date</div>
                        <div className="font-semibold">{end}</div>
                      </div>
                    )}
                  </div>

                  {linkedProductResolved && (
                    <div className="rounded border border-border/40 p-3">
                      <div className="text-xs text-muted-foreground">Linked Product</div>
                      <div className="font-semibold">{linkedProductResolved.name}</div>
                      <Button asChild className="mt-2 w-full sm:w-auto">
                        <Link to={`/product/${fundraiser.product_id}`}>View Product</Link>
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button asChild variant="outline">
                      <Link to="/fundraisers">← Back to Fundraisers</Link>
                    </Button>
                  </div>
                </CardContent>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default FundraiserDetails;
