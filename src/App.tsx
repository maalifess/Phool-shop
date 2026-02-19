import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import CustomOrders from "./pages/CustomOrders";
import Fundraisers from "./pages/Fundraisers";
import FundraiserDetails from "./pages/FundraiserDetails";
import Order from "./pages/Order";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Tokri from "./pages/Tokri";
import { CartProvider } from "@/lib/cart";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/custom-orders" element={<CustomOrders />} />
            <Route path="/fundraisers" element={<Fundraisers />} />
            <Route path="/fundraiser/:id" element={<FundraiserDetails />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/tokri" element={<Tokri />} />
            <Route path="/order" element={<Order />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
