import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { loadProducts, saveProducts, defaultProducts, Product } from "@/lib/products";
import { loadFundraisers, saveFundraisers, Fundraiser } from "@/lib/fundraisers";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [customMessageLimit, setCustomMessageLimit] = useState(150);
  const [editing, setEditing] = useState<number | null>(null);
  const [newProductName, setNewProductName] = useState("");

  useEffect(() => {
    const logged = localStorage.getItem("phool_admin_logged_in");
    if (!logged) navigate("/admin-login");
    setProducts(loadProducts());
    setFundraisers(loadFundraisers());
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("phool_custom_message_limit");
    if (raw) setCustomMessageLimit(Number(raw) || 150);
  }, []);

  useEffect(() => {
    try { localStorage.setItem("phool_custom_message_limit", String(customMessageLimit)); } catch (e) { }
  }, [customMessageLimit]);

  const save = (next: Product[]) => {
    setProducts(next);
    saveProducts(next);
  };

  const addProduct = () => {
    const next: Product = {
      id: Math.max(0, ...products.map((p) => p.id)) + 1,
      name: newProductName || "New Product",
      price: 10,
      category: "Uncategorized",
      images: ["🧶"],
      description: "",
      inStock: true,
    };
    const list = [...products, next];
    save(list);
    setNewProductName("");
    setEditing(next.id);
  };

  const updateProduct = (id: number, patch: Partial<Product>) => {
    const next = products.map((p) => (p.id === id ? { ...p, ...patch } : p));
    save(next);
  };

  const removeProduct = (id: number) => {
    const next = products.filter((p) => p.id !== id);
    save(next);
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

  return (
    <Layout>
      <section className="py-12">
        <div className="container">
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {/* Products */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Products</h2>
                <div className="flex items-center gap-2">
                  <Input placeholder="New product name" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
                  <Button onClick={addProduct}>Add</Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {products.filter((p) => !p.isCustom).map((p) => (
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
                        <Input value={p.images.join(",")} onChange={(e) => updateProduct(p.id, { images: e.target.value.split(",").map((s) => s.trim()) })} />
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
                              updateProduct(p.id, { images: [...p.images, ...arr] });
                            }}
                          />
                        </div>
                        <Textarea value={p.description} onChange={(e) => updateProduct(p.id, { description: e.target.value })} />
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm">In stock</label>
                            <input type="checkbox" checked={p.inStock} onChange={(e) => updateProduct(p.id, { inStock: e.target.checked })} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Cards</h2>
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
                      inStock: true,
                      isCustom: true,
                    };
                    const list = [...products, next];
                    save(list);
                    setNewProductName("");
                    setEditing(next.id);
                  }}>Add</Button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4">
                <label className="text-sm">Card message max chars</label>
                <Input type="number" value={String(customMessageLimit)} onChange={(e) => setCustomMessageLimit(Number(e.target.value) || 0)} />
              </div>

              <div className="mt-4 space-y-3">
                {products.filter((p) => p.isCustom).map((p) => (
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
                        <Input value={p.images.join(",")} onChange={(e) => updateProduct(p.id, { images: e.target.value.split(",").map((s) => s.trim()) })} />
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
                              updateProduct(p.id, { images: [...p.images, ...arr] });
                            }}
                          />
                        </div>
                        {/* description is not editable for Cards */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm">In stock</label>
                            <input type="checkbox" checked={p.inStock} onChange={(e) => updateProduct(p.id, { inStock: e.target.checked })} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fundraisers */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Fundraisers</h2>
                <Button onClick={addFund}>Add Fundraiser</Button>
              </div>

              <div className="mt-4 space-y-3">
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
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
