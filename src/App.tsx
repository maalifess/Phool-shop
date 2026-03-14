import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { CartProvider } from "@/lib/cart";

const Index = lazy(() => import("./pages/Index"));
const Catalog = lazy(() => import("./pages/Catalog"));
const CustomOrders = lazy(() => import("./pages/CustomOrders"));
const Fundraisers = lazy(() => import("./pages/Fundraisers"));
const FundraiserDetails = lazy(() => import("./pages/FundraiserDetails"));
const Order = lazy(() => import("./pages/Order"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Tokri = lazy(() => import("./pages/Tokri"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderTrackingPage = lazy(() => import("./pages/OrderTrackingPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes for product data
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const LoadingFallback = () => (
  <div style={{ position: 'fixed', inset: 0, background: '#fcf2e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mb-8"
      >
        <img 
          src="/assets/branding/phool.png" 
          alt="Phool Shop" 
          className="w-56 h-56 object-contain mx-auto"
        />
      </motion.div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="font-script text-2xl"
        style={{ color: '#6e4248' }}
      >
        Loading...
      </motion.div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
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
              <Route path="/order-tracking" element={<OrderTracking />} />
              <Route path="/track-order" element={<OrderTrackingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
