import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_USER = "admin";
const ADMIN_PASS = "password";

const AdminLogin = () => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      localStorage.setItem("phool_admin_logged_in", "1");
      navigate("/admin");
    } else {
      setError("Invalid credentials");
    }
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
                  <label className="text-sm text-muted-foreground">Username</label>
                  <Input value={user} onChange={(e) => setUser(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Password</label>
                  <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                </div>
                {error && <div className="text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full rounded-full">Sign in</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AdminLogin;
