import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Corte from "./pages/Corte";
import ProdutoAcabado from "./pages/ProdutoAcabado";
import Pedidos from "./pages/Pedidos";
import Situacao from "./pages/Situacao";
import PedidoDetalhes from "./pages/PedidoDetalhes";
import Estoque from "./pages/Estoque";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/corte" element={<Corte />} />
          <Route path="/produto-acabado" element={<ProdutoAcabado />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/situacao" element={<Situacao />} />
          <Route path="/situacao/:pedido" element={<PedidoDetalhes />} />
          <Route path="/estoque" element={<Estoque />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
