import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { CartProvider } from "@/lib/cart";
import { LoadingProvider } from "@/contexts/LoadingContext";
import LoadingSpinner from "@/components/LoadingSpinner";

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
      staleTime: 60000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <LoadingProvider>
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
      </LoadingProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
