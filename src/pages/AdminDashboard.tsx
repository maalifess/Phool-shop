import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentAdmin } from "@/lib/supabaseAuth";
import { loadProducts as loadSupabaseProducts, createProduct, updateProduct as updateSupabaseProduct, deleteProduct as deleteSupabaseProduct, uploadProductImage, type Product } from "@/lib/supabaseProducts";
import { loadCards, createCard, updateCard as updateCardSupabase, deleteCard } from "@/lib/supabaseCards";
import { loadFundraisers as loadSupabaseFundraisers, createFundraiser, updateFundraiser as updateFundraiserSupabase, deleteFundraiser } from "@/lib/supabaseFundraisers";
import { loadReviews, updateReview, deleteReview } from "@/lib/supabaseReviews";
import { loadAllOrders, updateOrderStatus as updateOrderStatusSupabase, deleteOrderByOrderId, type OrderRecord } from "@/lib/supabaseOrders";
import type { Card as SupabaseCard, Fundraiser as SupabaseFundraiser, Review } from "@/lib/supabaseTypes";
import { OrderStatusBadge } from "@/components/OrderStatusBadge";

type AdminSection = "add_products" | "add_cards" | "add_fundraiser" | "order_management" | "review_management";

type OrderStatus = "Under Process" | "Dispatched" | "Completed" | "Cancelled";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [fundraisers, setFundraisers] = useState<SupabaseFundraiser[]>([]);
  const [cards, setCards] = useState<SupabaseCard[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customMessageLimit, setCustomMessageLimit] = useState(150);
  const [editing, setEditing] = useState<number | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [newCardPrice, setNewCardPrice] = useState(200);
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardImage, setNewCardImage] = useState("");
  const [newFundTitle, setNewFundTitle] = useState("");
  const [newFundDescription, setNewFundDescription] = useState("");
  const [newFundGoalPkr, setNewFundGoalPkr] = useState<number>(0);
  const [newFundStartDate, setNewFundStartDate] = useState("");
  const [newFundEndDate, setNewFundEndDate] = useState("");
  const [newFundProductId, setNewFundProductId] = useState<number | "">("");
  const [newFundImage, setNewFundImage] = useState("");
  const [section, setSection] = useState<AdminSection>("add_products");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [sortKey, setSortKey] = useState<"timestamp" | "status">("timestamp");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    (async () => {
      const admin = await getCurrentAdmin();
      if (!admin) {
        navigate("/admin-login");
        return;
      }

      const [nextProducts, nextCards, nextSupabaseFundraisers, nextReviews] = await Promise.all([
        loadSupabaseProducts(),
        loadCards(),
        loadSupabaseFundraisers(),
        loadReviews(),
      ]);
      setProducts(nextProducts);
      setCards(nextCards);
      setFundraisers(nextSupabaseFundraisers);
      setReviews(nextReviews);

      setSection("add_products");

      // Load orders from Supabase
      const supabaseOrders = await loadAllOrders();
      setOrders(supabaseOrders);
    })();
  }, [navigate]);

  const normalizeImages = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "string") {
      const s = v.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch (e) {
        // fallthrough
      }
      return s.split(",").map((x) => x.trim()).filter(Boolean);
    }
    return [];
  };

  const save = async (next: Product[]) => {
    setProducts(next);
    // No localStorage save; we use individual Supabase operations
  };

  const addProduct = async () => {
    const newProduct: Omit<Product, 'id' | 'created_at'> = {
      name: newProductName || "New Product",
      price: 10,
      category: "Uncategorized",
      images: [],
      description: "",
      in_stock: true,
      is_custom: false,
    };
    const created = await createProduct(newProduct);
    if (created) {
      setProducts(prev => [...prev, created]);
      setNewProductName("");
      setEditing(created.id);
    }
  };

  const updateProduct = async (id: number, patch: Partial<Product>) => {
    const updated = await updateSupabaseProduct(id, patch);
    if (updated) {
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
    }
  };

  const removeProduct = async (id: number) => {
    const ok = await deleteSupabaseProduct(id);
    if (ok) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Cards CRUD
  const addCard = async () => {
    const newCard: Omit<SupabaseCard, 'id' | 'created_at'> = {
      name: newProductName || "Card",
      price: newCardPrice,
      category: "Cards",
      images: newCardImage ? [newCardImage] : ["🪪"],
      description: newCardDescription,
      in_stock: true,
      is_custom: true,
    };
    const created = await createCard(newCard);
    if (created) {
      setCards(prev => [...prev, created]);
      setNewProductName("");
      setNewCardPrice(200);
      setNewCardDescription("");
      setNewCardImage("");
      setEditing(created.id);
    }
  };

  const updateCard = async (id: number, patch: Partial<SupabaseCard>) => {
    const updated = await updateCardSupabase(id, patch);
    if (updated) {
      setCards(prev => prev.map(c => c.id === id ? updated : c));
    }
  };

  const removeCard = async (id: number) => {
    const ok = await deleteCard(id);
    if (ok) {
      setCards(prev => prev.filter(c => c.id !== id));
    }
  };

  // Fundraisers CRUD (Supabase)
  const addFund = async () => {
    const goalPkr = Number(newFundGoalPkr) || 0;
    const newFundraiser: Omit<SupabaseFundraiser, 'id' | 'created_at'> = {
      title: newFundTitle || "New Fundraiser",
      description: newFundDescription || "",
      goal: `PKR ${goalPkr}`,
      goal_pkr: goalPkr,
      start_date: newFundStartDate || undefined,
      end_date: newFundEndDate || undefined,
      product_id: typeof newFundProductId === "number" ? newFundProductId : undefined,
      image: newFundImage || undefined,
      active: true,
    };
    const created = await createFundraiser(newFundraiser);
    if (created) {
      setFundraisers(prev => [...prev, created]);
      setNewFundTitle("");
      setNewFundDescription("");
      setNewFundGoalPkr(0);
      setNewFundStartDate("");
      setNewFundEndDate("");
      setNewFundProductId("");
      setNewFundImage("");
      setEditing(created.id);
    }
  };

  const updateFundraiser = async (id: number, patch: Partial<SupabaseFundraiser>) => {
    const updated = await updateFundraiserSupabase(id, patch);
    if (updated) {
      setFundraisers(prev => prev.map(f => f.id === id ? updated : f));
    }
  };

  const removeFundraiser = async (id: number) => {
    const ok = await deleteFundraiser(id);
    if (ok) {
      setFundraisers(prev => prev.filter(f => f.id !== id));
    }
  };

  // Reviews CRUD
  const deleteReviewAdmin = async (id: number) => {
    const ok = await deleteReview(id);
    if (ok) {
      setReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  // Refresh reviews function
  const refreshReviews = async () => {
    const nextReviews = await loadReviews();
    setReviews(nextReviews);
  };

  const statusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
      case "Dispatched":
        return "bg-sky-500/15 text-sky-700 border-sky-500/30";
      case "Cancelled":
        return "bg-rose-500/15 text-rose-700 border-rose-500/30";
      case "Under Process":
      default:
        return "bg-amber-500/15 text-amber-800 border-amber-500/30";
    }
  };

  const customOrderBadgeClass = "bg-violet-500/15 text-violet-700 border-violet-500/30";
  const regularOrderBadgeClass = "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const ok = await updateOrderStatusSupabase(orderId, status);
    if (ok) {
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, status } : o));
    }
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    if (!confirm("Delete this order? This action cannot be undone.")) return;
    const ok = await deleteOrderByOrderId(orderId);
    if (ok) {
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
    }
  }, []);

  const orderCountByStatus = useMemo(() => {
    const init: Record<OrderStatus, number> = {
      "Under Process": 0,
      Dispatched: 0,
      Completed: 0,
      Cancelled: 0,
    };
    for (const o of orders) {
      const s = (o.status || "Under Process") as OrderStatus;
      init[s] += 1;
    }
    return init;
  }, [orders]);

  const sectionButtonVariant = (s: AdminSection) => (section === s ? "default" : "outline");

  const displayOrders = useMemo(() => {
    const sorted = [...orders];
    if (sortKey === "timestamp") {
      sorted.sort((a, b) => {
        const ta = new Date(a.created_at || 0).getTime();
        const tb = new Date(b.created_at || 0).getTime();
        return sortDirection === "desc" ? tb - ta : ta - tb;
      });
    } else if (sortKey === "status") {
      const statusOrder: Record<OrderStatus, number> = { "Under Process": 0, Dispatched: 1, Completed: 2, Cancelled: 3 };
      sorted.sort((a, b) => {
        const sa = statusOrder[(a.status || "Under Process") as OrderStatus];
        const sb = statusOrder[(b.status || "Under Process") as OrderStatus];
        return sortDirection === "desc" ? sb - sa : sa - sb;
      });
    }
    return sorted;
  }, [orders, sortKey, sortDirection]);

  const resetSorting = () => {
    setSortKey("timestamp");
    setSortDirection("desc");
  };

  const fundraiserProductNameSet = useMemo(() => {
    const names = new Set<string>();
    for (const f of fundraisers) {
      if (!f.product_id) continue;
      const p = products.find((pp) => pp.id === f.product_id);
      if (!p) continue;
      names.add(p.name.toLowerCase());
    }
    return names;
  }, [fundraisers, products]);

  const fundraiserOrderIdSet = useMemo(() => {
    const set = new Set<string>();
    if (fundraiserProductNameSet.size === 0) return set;
    for (const o of orders) {
      if (!o.products) continue;
      const productNames = o.products.split(",").map((s) => s.trim().toLowerCase());
      const isFundraiser = productNames.some((n) => fundraiserProductNameSet.has(n));
      if (isFundraiser) set.add(o.order_id);
    }
    return set;
  }, [orders, fundraiserProductNameSet]);

  return (
    <Layout>
      <section className="py-12">
        <div className="container">
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant={sectionButtonVariant("add_products")} onClick={() => setSection("add_products")}>
              Add Products
            </Button>
            <Button variant={sectionButtonVariant("add_cards")} onClick={() => setSection("add_cards")}>
              Add Cards
            </Button>
            <Button variant={sectionButtonVariant("add_fundraiser")} onClick={() => setSection("add_fundraiser")}>
              Add Fundraiser
            </Button>
            <Button variant={sectionButtonVariant("review_management")} onClick={() => setSection("review_management")}>
              Review Management
            </Button>
            <Button variant={sectionButtonVariant("order_management")} onClick={() => setSection("order_management")}>
              Order Management
            </Button>
          </div>

          <div className="mt-8">
            {(() => {
              switch (section) {
                case "add_products":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <CardTitle className="font-display">Add Products</CardTitle>
                          <div className="flex items-center gap-2">
                            <Input placeholder="New product name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                            <Button onClick={addProduct}>Add</Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {products.map((p) => (
                            <div key={p.id} className="rounded border border-border/40 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{p.name}</div>
                                  <div className="text-sm text-muted-foreground">ID: {p.id} • {p.category}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" onClick={() => setEditing(editing === p.id ? null : p.id)}>Edit</Button>
                                  <Button variant="destructive" onClick={() => removeProduct(p.id)}>Delete</Button>
                                </div>
                              </div>

                              {editing === p.id && (
                                <div className="mt-3 space-y-2">
                                  <Input
                                    defaultValue={p.name}
                                    onBlur={(e) => {
                                      const v = e.target.value;
                                      if (v !== p.name) updateProduct(p.id, { name: v });
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={String(p.price)}
                                    onBlur={(e) => {
                                      const v = Number(e.target.value);
                                      if (!Number.isNaN(v) && v !== p.price) updateProduct(p.id, { price: v });
                                    }}
                                  />
                                  <Input
                                    defaultValue={p.category}
                                    onBlur={(e) => {
                                      const v = e.target.value;
                                      if (v !== p.category) updateProduct(p.id, { category: v });
                                    }}
                                  />
                                  <Input
                                    defaultValue={normalizeImages(p.images).join(",")}
                                    onBlur={(e) => {
                                      const next = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                      const prevNorm = normalizeImages(p.images);
                                      if (e.target.value !== prevNorm.join(",")) updateProduct(p.id, { images: next });
                                    }}
                                  />
                                  <div className="mt-2">
                                    <label className="text-sm">Upload images</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files) return;
                                        const toDataURL = (file: File) => new Promise<string>((res, rej) => {
                                          const reader = new FileReader();
                                          reader.onload = () => res(String(reader.result));
                                          reader.onerror = rej;
                                          reader.readAsDataURL(file);
                                        });
                                        const arr: string[] = [];
                                        for (let i = 0; i < files.length; i++) {
                                          try { arr.push(await toDataURL(files[i])); } catch (err) { console.error(err); }
                                        }
                                        const existing = normalizeImages(p.images);
                                        updateProduct(p.id, { images: [...existing, ...arr] });
                                      }}
                                    />
                                  </div>
                                  <Textarea
                                    defaultValue={p.description}
                                    onBlur={(e) => {
                                      const v = e.target.value;
                                      if (v !== p.description) updateProduct(p.id, { description: v });
                                    }}
                                  />
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm">In stock</label>
                                      <input type="checkbox" checked={p.in_stock} onChange={(e) => updateProduct(p.id, { in_stock: e.target.checked })} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                case "add_cards":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex flex-col gap-4">
                          <CardTitle className="font-display">Add Cards</CardTitle>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input placeholder="Card name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                            <Input type="number" placeholder="Price" value={newCardPrice} onChange={(e) => setNewCardPrice(Number(e.target.value) || 0)} />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input placeholder="Image URL (optional)" value={newCardImage} onChange={(e) => setNewCardImage(e.target.value)} />
                            <Button onClick={addCard}>Add Card</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium">Or upload image:</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const toDataURL = (file: File) => new Promise<string>((res, rej) => {
                                    const reader = new FileReader();
                                    reader.onload = () => res(String(reader.result));
                                    reader.onerror = rej;
                                    reader.readAsDataURL(file);
                                  });
                                  try {
                                    const dataUrl = await toDataURL(file);
                                    setNewCardImage(dataUrl);
                                  } catch (err) {
                                    console.error('Error reading file:', err);
                                  }
                                }
                              }}
                            />
                          </div>
                          <Textarea 
                            placeholder="Card description (optional)" 
                            value={newCardDescription} 
                            onChange={(e) => setNewCardDescription(e.target.value)} 
                            rows={2}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <label className="text-sm">Card message max chars</label>
                          <Input type="number" value={String(customMessageLimit)} onChange={(e) => setCustomMessageLimit(Number(e.target.value) || 0)} />
                        </div>

                        <div className="mt-4 space-y-3">
                          {cards.map((c) => (
                            <div key={c.id} className="rounded border border-border/40 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{c.name}</div>
                                  <div className="text-sm text-muted-foreground">ID: {c.id} • {c.category}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" onClick={() => setEditing(editing === c.id ? null : c.id)}>Edit</Button>
                                  <Button variant="destructive" onClick={() => removeCard(c.id)}>Delete</Button>
                                </div>
                              </div>

                              {editing === c.id && (
                                <div className="mt-3 space-y-2">
                                  <Input
                                    defaultValue={c.name}
                                    onBlur={(e) => {
                                      const v = e.target.value;
                                      if (v !== c.name) updateCard(c.id, { name: v });
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={String(c.price)}
                                    onBlur={(e) => {
                                      const v = Number(e.target.value);
                                      if (!Number.isNaN(v) && v !== c.price) updateCard(c.id, { price: v });
                                    }}
                                  />
                                  <Input
                                    defaultValue={normalizeImages(c.images).join(",")}
                                    onBlur={(e) => {
                                      const next = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                                      const prevNorm = normalizeImages(c.images);
                                      if (e.target.value !== prevNorm.join(",")) updateCard(c.id, { images: next });
                                    }}
                                  />
                                  <div className="mt-2">
                                    <label className="text-sm">Upload images</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files) return;
                                        const toDataURL = (file: File) => new Promise<string>((res, rej) => {
                                          const reader = new FileReader();
                                          reader.onload = () => res(String(reader.result));
                                          reader.onerror = rej;
                                          reader.readAsDataURL(file);
                                        });
                                        const arr: string[] = [];
                                        for (let i = 0; i < files.length; i++) {
                                          try { arr.push(await toDataURL(files[i])); } catch (err) { console.error(err); }
                                        }
                                        const existing = normalizeImages(c.images);
                                        updateCard(c.id, { images: [...existing, ...arr] });
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                      <label className="text-sm">In stock</label>
                                      <input
                                        type="checkbox"
                                        defaultChecked={c.in_stock}
                                        onChange={(e) => updateCard(c.id, { in_stock: e.target.checked })}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                case "add_fundraiser":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex flex-col gap-4">
                          <CardTitle className="font-display">Add Fundraiser</CardTitle>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Fundraiser Name</label>
                              <Input
                                placeholder="Fundraiser name"
                                value={newFundTitle}
                                onChange={(e) => setNewFundTitle(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Goal (PKR)</label>
                              <Input
                                type="number"
                                placeholder="Goal (PKR)"
                                value={String(newFundGoalPkr)}
                                onChange={(e) => setNewFundGoalPkr(Number(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          <Textarea
                            placeholder="Fundraiser description"
                            value={newFundDescription}
                            onChange={(e) => setNewFundDescription(e.target.value)}
                            rows={2}
                          />

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Start Date</label>
                              <Input
                                type="date"
                                value={newFundStartDate}
                                onChange={(e) => setNewFundStartDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">End Date</label>
                              <Input
                                type="date"
                                value={newFundEndDate}
                                onChange={(e) => setNewFundEndDate(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Image URL (optional)</label>
                              <Input
                                placeholder="Image URL (optional)"
                                value={newFundImage}
                                onChange={(e) => setNewFundImage(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Or upload image</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const toDataURL = (file: File) => new Promise<string>((res, rej) => {
                                      const reader = new FileReader();
                                      reader.onload = () => res(String(reader.result));
                                      reader.onerror = rej;
                                      reader.readAsDataURL(file);
                                    });
                                    try {
                                      const dataUrl = await toDataURL(file);
                                      setNewFundImage(dataUrl);
                                    } catch (err) {
                                      console.error('Error reading file:', err);
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <select
                              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                              value={newFundProductId === "" ? "" : String(newFundProductId)}
                              onChange={(e) => setNewFundProductId(e.target.value ? Number(e.target.value) : "")}
                            >
                              <option value="">No linked product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <Button onClick={addFund}>Add Fundraiser</Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {fundraisers.map((f) => (
                            <div key={f.id} className="rounded border border-border/40 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{f.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Goal: {typeof f.goal_pkr === "number" ? `PKR ${f.goal_pkr}` : f.goal}
                                    {f.start_date && (
                                      <span> • {new Date(f.start_date).toLocaleDateString()}</span>
                                    )}
                                    {f.end_date && (
                                      <span> - {new Date(f.end_date).toLocaleDateString()}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" onClick={() => setEditing(editing === f.id ? null : f.id)}>Edit</Button>
                                  <Button variant="destructive" onClick={() => removeFundraiser(f.id)}>Delete</Button>
                                </div>
                              </div>

                              {editing === f.id && (
                                <div className="mt-3 space-y-2">
                                  <Input
                                    defaultValue={f.title}
                                    onBlur={(e) => {
                                      const v = e.target.value;
                                      if (v !== f.title) updateFundraiser(f.id, { title: v });
                                    }}
                                  />
                                  <Textarea
                                    defaultValue={f.description}
                                    onBlur={(e) => {
                                      const v = e.target.value;
                                      if (v !== f.description) updateFundraiser(f.id, { description: v });
                                    }}
                                  />
                                  <Input
                                    type="number"
                                    defaultValue={String(typeof f.goal_pkr === "number" ? f.goal_pkr : 0)}
                                    onBlur={(e) => {
                                      const n = Number(e.target.value) || 0;
                                      if (n !== (typeof f.goal_pkr === "number" ? f.goal_pkr : 0)) {
                                        updateFundraiser(f.id, { goal_pkr: n, goal: `PKR ${n}` });
                                      }
                                    }}
                                  />
                                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                    <Input
                                      type="date"
                                      defaultValue={f.start_date || ""}
                                      onBlur={(e) => {
                                        const v = e.target.value;
                                        if (v !== (f.start_date || "")) updateFundraiser(f.id, { start_date: v || null });
                                      }}
                                    />
                                    <Input
                                      type="date"
                                      defaultValue={f.end_date || ""}
                                      onBlur={(e) => {
                                        const v = e.target.value;
                                        if (v !== (f.end_date || "")) updateFundraiser(f.id, { end_date: v || null });
                                      }}
                                    />
                                  </div>
                                  <select
                                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                    defaultValue={typeof f.product_id === "number" ? String(f.product_id) : ""}
                                    onChange={(e) => {
                                      const v = e.target.value ? Number(e.target.value) : null;
                                      updateFundraiser(f.id, { product_id: v });
                                    }}
                                  >
                                    <option value="">No linked product</option>
                                    {products.map((p) => (
                                      <option key={p.id} value={p.id}>
                                        {p.name}
                                      </option>
                                    ))}
                                  </select>
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm">Status</label>
                                    <Select
                                      defaultValue={f.active ? "active" : "finished"}
                                      onValueChange={(v) => updateFundraiser(f.id, { active: v === "active" })}
                                    >
                                      <SelectTrigger className="h-9 w-[180px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="finished">Finished</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                case "review_management":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <CardTitle className="font-display">Review Management</CardTitle>
                          <Button variant="outline" onClick={refreshReviews}>
                            Refresh
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reviews.map((review) => (
                            <div key={review.id} className="rounded border border-border/40 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{review.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Product ID: {review.product_id} • Rating: {review.rating}/5
                                  </div>
                                  <div className="mt-1 text-sm">{review.comment}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30">
                                    Published
                                  </Badge>
                                  <Button variant="destructive" onClick={() => deleteReviewAdmin(review.id)}>
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {reviews.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                              No reviews yet
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                case "order_management":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <CardTitle className="font-display">Order Management</CardTitle>
                          <div className="flex items-center gap-2">
                            <Select value={sortKey} onValueChange={(v) => setSortKey(v as "timestamp" | "status")}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="timestamp">Date</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => setSortDirection(sortDirection === "desc" ? "asc" : "desc")}>
                              {sortDirection === "desc" ? "↓" : "↑"}
                            </Button>
                            <Button variant="outline" onClick={resetSorting}>Reset</Button>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          {Object.entries(orderCountByStatus).map(([status, count]) => (
                            <Badge key={status} className={statusBadgeClass(status as OrderStatus)}>
                              {status}: {count}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {displayOrders.map((o) => {
                            const isFundraiser = fundraiserOrderIdSet.has(o.order_id);
                            return (
                              <div key={o.order_id} className="rounded border border-border/40 p-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div>
                                    <div className="font-mono text-xs font-bold text-primary mb-1">{o.order_id}</div>
                                    <div className="font-medium">{o.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {o.email ? `${o.email} • ` : ""}{o.phone ? `${o.phone} • ` : ""}{new Date(o.created_at || 0).toLocaleString()}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                                      <OrderStatusBadge status={o.status} />
                                      {isFundraiser && (
                                        <Badge className="bg-orange-500/15 text-orange-700 border-orange-500/30">
                                          Fundraiser
                                        </Badge>
                                      )}
                                      {o.gift_wrap && (
                                        <Badge className="bg-pink-500/15 text-pink-700 border-pink-500/30">
                                          Gift Wrapped
                                        </Badge>
                                      )}
                                      {o.promo_code && (
                                        <Badge className="bg-violet-500/15 text-violet-700 border-violet-500/30">
                                          Promo: {o.promo_code}
                                        </Badge>
                                      )}
                                      {typeof o.total === "number" && (
                                        <span className="text-sm font-bold text-foreground">PKR {o.total}</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Select value={o.status || "Under Process"} onValueChange={(v) => updateOrderStatus(o.order_id, v as OrderStatus)}>
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Under Process">Under Process</SelectItem>
                                        <SelectItem value="Dispatched">Dispatched</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button variant="destructive" onClick={() => deleteOrder(o.order_id)}>Delete</Button>
                                  </div>
                                </div>
                                <div className="mt-2 text-sm space-y-0.5">
                                  <div><span className="font-medium">Products:</span> {o.products}</div>
                                  {o.address && <div><span className="font-medium">Address:</span> {o.address}</div>}
                                  {o.notes && <div><span className="font-medium">Notes:</span> {o.notes}</div>}
                                  {o.custom_description && <div><span className="font-medium">Custom:</span> {o.custom_description}</div>}
                                  {typeof o.discount === "number" && Number(o.discount) > 0 && (
                                    <div className="text-green-600"><span className="font-medium">Discount:</span> PKR {o.discount}</div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
              }
            })()}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
