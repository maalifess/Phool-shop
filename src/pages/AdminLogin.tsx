import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signInAdmin, getCurrentAdmin } from "@/lib/supabaseAuth";

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signInAdmin(email, password);
    if (error) {
      setError(error.message);
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <Layout>
      <section className="py-24">
        <div className="container max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-xl">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full rounded-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AdminLogin;
