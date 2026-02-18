import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadFundraisers, saveFundraisers, Fundraiser } from "@/lib/fundraisers";
import { getCurrentAdmin } from "@/lib/supabaseAuth";
import { loadProducts as loadSupabaseProducts, createProduct, updateProduct as updateSupabaseProduct, deleteProduct as deleteSupabaseProduct, uploadProductImage, type Product } from "@/lib/supabaseProducts";

type AdminSection = "add_products" | "add_cards" | "add_fundraiser" | "order_management";

type OrderStatus = "Under Process" | "Dispatched" | "Completed" | "Cancelled";

type StoredOrder = {
  timestamp: string;
  orderType?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  products?: string;
  quantity?: string;
  paymentMethod?: string;
  notes?: string;
  status?: OrderStatus;
  customDescription?: string;
  customColors?: string;
  customTimeline?: string;
  error?: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [customMessageLimit, setCustomMessageLimit] = useState(150);
  const [editing, setEditing] = useState<number | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [section, setSection] = useState<AdminSection>("add_products");
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [sortKey, setSortKey] = useState<"timestamp" | "status">("timestamp");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

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

  useEffect(() => {
    (async () => {
      const admin = await getCurrentAdmin();
      if (!admin) {
        navigate("/admin-login");
        return;
      }
      const products = await loadSupabaseProducts();
      setProducts(products);
      setFundraisers(loadFundraisers());
      setSection("add_products");
    })();
  }, []);

  useEffect(() => {
    if (section !== "order_management") return;
    try {
      const raw = localStorage.getItem("phool_orders_backup");
      const parsed = raw ? (JSON.parse(raw) as StoredOrder[]) : [];
      setOrders(Array.isArray(parsed) ? [...parsed].reverse() : []);
    } catch (e) {
      setOrders([]);
    }
  }, [section]);

  useEffect(() => {
    const raw = localStorage.getItem("phool_custom_message_limit");
    if (raw) setCustomMessageLimit(Number(raw) || 150);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("phool_custom_message_limit", String(customMessageLimit)); } catch (e) { }
  }, [customMessageLimit]);

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

  const saveFund = (next: Fundraiser[]) => {
    setFundraisers(next);
    saveFundraisers(next);
  };

  const addFund = () => {
    const next: Fundraiser = {
      id: Math.max(0, ...fundraisers.map((f) => f.id)) + 1,
      title: "New Fundraiser",
      description: "",
      goal: "PKR 0",
      active: true,
    };
    const list = [...fundraisers, next];
    saveFund(list);
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

  const makeOrderKey = useCallback((o: StoredOrder) => {
    return `${o.timestamp ?? ""}-${o.email ?? ""}-${o.phone ?? ""}-${o.products ?? ""}`;
  }, []);

  const persistOrders = (nextNewestFirst: StoredOrder[]) => {
    try {
      const oldestFirst = [...nextNewestFirst].reverse();
      localStorage.setItem("phool_orders_backup", JSON.stringify(oldestFirst));
    } catch (e) {
      // ignore
    }
  };

  const updateOrderStatus = useCallback((orderKey: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => {
        const key = makeOrderKey(o);
        if (key !== orderKey) return o;
        return { ...o, status };
      });
      persistOrders(next);
      return next;
    });
  }, [makeOrderKey]);

  const deleteOrder = useCallback((orderKey: string) => {
    if (!confirm("Delete this order? This action cannot be undone.")) return;
    setOrders((prev) => {
      const next = prev.filter((o) => {
        const key = makeOrderKey(o);
        return key !== orderKey;
      });
      persistOrders(next);
      return next;
    });
  }, [makeOrderKey]);

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
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return sortDirection === "desc" ? tb - ta : ta - tb;
      });
    } else if (sortKey === "status") {
      const statusOrder: Record<OrderStatus, number> = { "Under Process": 0, Dispatched: 1, Completed: 2, Cancelled: 3 };
      sorted.sort((a, b) => {
        const sa = statusOrder[a.status || "Under Process"];
        const sb = statusOrder[b.status || "Under Process"];
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
      if (!f.productId) continue;
      const p = products.find((pp) => pp.id === f.productId);
      if (!p) continue;
      names.add(p.name.toLowerCase());
    }
    return names;
  }, [fundraisers, products]);

  const orderIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    for (let i = 0; i < orders.length; i++) {
      m.set(makeOrderKey(orders[i]), i);
    }
    return m;
  }, [orders, makeOrderKey]);

  const fundraiserOrderKeySet = useMemo(() => {
    const set = new Set<string>();
    if (fundraiserProductNameSet.size === 0) return set;
    for (const o of orders) {
      if (!o.products) continue;
      const productNames = o.products.split(",").map((s) => s.trim().toLowerCase());
      const isFundraiser = productNames.some((n) => fundraiserProductNameSet.has(n));
      if (isFundraiser) set.add(makeOrderKey(o));
    }
    return set;
  }, [orders, fundraiserProductNameSet, makeOrderKey]);

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
                          {products.filter((p) => !p.is_custom).map((p) => (
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
                                  <Input value={p.name} onChange={(e) => updateProduct(p.id, { name: e.target.value })} />
                                  <Input type="number" value={String(p.price)} onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })} />
                                  <Input value={p.category} onChange={(e) => updateProduct(p.id, { category: e.target.value })} />
                                  <Input value={normalizeImages(p.images).join(",")} onChange={(e) => updateProduct(p.id, { images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
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
                                  <Textarea value={p.description} onChange={(e) => updateProduct(p.id, { description: e.target.value })} />
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
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <CardTitle className="font-display">Add Cards</CardTitle>
                          <div className="flex items-center gap-2">
                            <Input placeholder="New custom name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                            <Button onClick={() => {
                              const next: Product = {
                                id: Math.max(0, ...products.map((p) => p.id)) + 1,
                                name: newProductName || "Card",
                                price: 200,
                                category: "Cards",
                                images: ["🪪"],
                                description: "",
                                in_stock: true,
                                is_custom: true,
                              };
                              const list = [...products, next];
                              save(list);
                              setNewProductName("");
                              setEditing(next.id);
                            }}>Add</Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4">
                          <label className="text-sm">Card message max chars</label>
                          <Input type="number" value={String(customMessageLimit)} onChange={(e) => setCustomMessageLimit(Number(e.target.value) || 0)} />
                        </div>

                        <div className="mt-4 space-y-3">
                          {products.filter((p) => p.is_custom).map((p) => (
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
                                  <Input value={p.name} onChange={(e) => updateProduct(p.id, { name: e.target.value })} />
                                  <Input type="number" value={String(p.price)} onChange={(e) => updateProduct(p.id, { price: Number(e.target.value) })} />
                                  <Input value={normalizeImages(p.images).join(",")} onChange={(e) => updateProduct(p.id, { images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
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
                case "add_fundraiser":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="font-display">Add Fundraiser</CardTitle>
                          <Button onClick={addFund}>Add Fundraiser</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {fundraisers.map((f) => (
                            <div key={f.id} className="rounded border border-border/40 p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{f.title}</div>
                                  <div className="text-sm text-muted-foreground">Goal: {f.goal}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button onClick={() => {
                                    const next = fundraisers.map((ff) => ff.id === f.id ? { ...ff, active: !ff.active } : ff);
                                    saveFund(next);
                                  }}>{f.active ? 'Disable' : 'Enable'}</Button>
                                  <Button variant="destructive" onClick={() => saveFund(fundraisers.filter((ff) => ff.id !== f.id))}>Delete</Button>
                                </div>
                              </div>

                              <div className="mt-2 space-y-2">
                                <Input value={f.title} onChange={(e) => saveFund(fundraisers.map((ff) => ff.id === f.id ? { ...ff, title: e.target.value } : ff))} />
                                <Input value={f.goal} onChange={(e) => saveFund(fundraisers.map((ff) => ff.id === f.id ? { ...ff, goal: e.target.value } : ff))} />
                                <Textarea value={f.description} onChange={(e) => saveFund(fundraisers.map((ff) => ff.id === f.id ? { ...ff, description: e.target.value } : ff))} />
                                <div>
                                  <label className="text-sm">Link to product id (optional)</label>
                                  <Input value={String(f.productId ?? '')} onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : undefined;
                                    saveFund(fundraisers.map((ff) => ff.id === f.id ? { ...ff, productId: val } : ff));
                                  }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                case "order_management":
                  return (
                    <Card className="border-border/40">
                      <CardHeader>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <CardTitle className="font-display">Order Management</CardTitle>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Total: {orders.length} • Under Process: {orderCountByStatus["Under Process"]} • Dispatched: {orderCountByStatus.Dispatched} • Completed: {orderCountByStatus.Completed} • Cancelled: {orderCountByStatus.Cancelled}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={sortKey} onValueChange={(v) => setSortKey(v as "timestamp" | "status")}>
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="timestamp">Date</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={sortDirection} onValueChange={(v) => setSortDirection(v as "asc" | "desc")}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desc">Newest first</SelectItem>
                                <SelectItem value="asc">Oldest first</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="outline" size="sm" onClick={resetSorting}>
                              Reset
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {orders.length === 0 ? (
                          <div className="rounded border border-border/40 p-6 text-sm text-muted-foreground">
                            No orders found in local storage.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {displayOrders.map((o, idx) => {
                              const key = makeOrderKey(o);
                              const status = (o.status || "Under Process") as OrderStatus;
                              const originalIndex = orderIndexMap.get(key) ?? -1;
                              const orderNumber = originalIndex >= 0 ? orders.length - originalIndex : orders.length;
                              const isFundraiser = fundraiserOrderKeySet.has(key);
                              return (
                                <div key={`${key}-${idx}`} className="rounded-lg border border-border/40 p-4">
                                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded">#{orderNumber}</span>
                                        <div className="font-medium">{o.name || "(No name)"}</div>
                                        <Badge variant="outline" className={statusBadgeClass(status)}>
                                          {status}
                                        </Badge>
                                        {o.orderType && (
                                          <Badge variant="outline" className={o.orderType === "custom" ? customOrderBadgeClass : regularOrderBadgeClass}>
                                            {o.orderType === "custom" ? "Custom" : "Regular"}
                                          </Badge>
                                        )}
                                        {isFundraiser && (
                                          <Badge variant="outline" className="bg-orange-500/15 text-orange-700 border-orange-500/30">
                                            Fundraiser
                                          </Badge>
                                        )}
                                        {o.error && (
                                          <Badge variant="destructive">Sync Error</Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {o.timestamp ? new Date(o.timestamp).toLocaleString() : ""}
                                      </div>
                                    </div>

                                    <div className="w-full md:w-64">
                                      <Select value={status} onValueChange={(v) => updateOrderStatus(key, v as OrderStatus)}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Under Process">Under Process</SelectItem>
                                          <SelectItem value="Dispatched">Dispatched</SelectItem>
                                          <SelectItem value="Completed">Completed</SelectItem>
                                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                                    <div className="rounded border border-border/40 p-3">
                                      <div className="text-xs font-medium text-muted-foreground">Customer Info</div>
                                      <div className="mt-1 text-sm">
                                        <div><span className="font-medium">Email:</span> {o.email || ""}</div>
                                        <div><span className="font-medium">Phone:</span> {o.phone || ""}</div>
                                      </div>
                                    </div>

                                    <div className="rounded border border-border/40 p-3">
                                      <div className="text-xs font-medium text-muted-foreground">Order Details</div>
                                      <div className="mt-1 text-sm">
                                        <div><span className="font-medium">Address:</span> {o.address || ""}</div>
                                        <div><span className="font-medium">Products:</span> {o.products || ""}{o.quantity ? ` (Qty: ${o.quantity})` : ""}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {(o.notes || o.customDescription || o.customColors || o.customTimeline) && (
                                    <div className="mt-3 rounded border border-border/40 p-3">
                                      <div className="text-xs font-medium text-muted-foreground">Additional Notes</div>
                                      <div className="mt-1 text-sm space-y-1">
                                        {o.notes && <div>{o.notes}</div>}
                                        {o.customDescription && <div><span className="font-medium">Custom:</span> {o.customDescription}</div>}
                                        {o.customColors && <div><span className="font-medium">Colors:</span> {o.customColors}</div>}
                                        {o.customTimeline && <div><span className="font-medium">Timeline:</span> {o.customTimeline}</div>}
                                      </div>
                                    </div>
                                  )}
                                  <div className="mt-3 flex justify-end">
                                    <Button variant="destructive" size="sm" onClick={() => deleteOrder(key)}>
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                default:
                  return null;
              }
            })()}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
