import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ErrorBoundary from "@/components/ErrorBoundary";
import MobileOnly from "@/components/MobileOnly";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Roleta from "./pages/Roleta";
import Ofertas from "./pages/Ofertas";
import Produto from "./pages/Produto";

import CheckoutSuccess from "./pages/CheckoutSuccess";
import DireccionEntrega from "./pages/DireccionEntrega";
import SoporteEntrega from "./pages/SoporteEntrega";
import UpsellErro from "./pages/UpsellErro";
import Rastreo from "./pages/Rastreo";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
        <CartProvider>
        <MobileOnly>
        <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/ruleta" element={<Roleta />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/producto/:id" element={<Produto />} />
            
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/direccion" element={<DireccionEntrega />} />
             <Route path="/soporte-entrega" element={<SoporteEntrega />} />
            <Route path="/upsell-erro" element={<UpsellErro />} />
            <Route path="/rastreo" element={<Rastreo />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ErrorBoundary>
        </MobileOnly>
        </CartProvider>
      
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
