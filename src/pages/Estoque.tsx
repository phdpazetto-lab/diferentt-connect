import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ItemEstoque {
  id_peca: string;
  descricao: string;
  tamanhos: string[];
  cores: string[];
  total: number;
  reservas?: Array<{ cliente: string; total: number }>;
  totalReservado?: number;
}

const Estoque = () => {
  const [busca, setBusca] = useState("");
  const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calcularEstoque();
  }, []);

  const calcularEstoque = async () => {
    setLoading(true);

    try {
      // Buscar produtos acabados (entradas)
      const { data: produtosAcabados, error: errorProdutos } = await supabase
        .from("produto_acabado")
        .select("*");

      if (errorProdutos) throw errorProdutos;

      // Buscar pedidos entregues (saídas)
      const { data: pedidosEntregues, error: errorPedidos } = await supabase
        .from("pedidos")
        .select("pedido, status")
        .eq("status", "Entregue");

      if (errorPedidos) throw errorPedidos;

      const pedidosEntreguesIds = pedidosEntregues?.map(p => p.pedido) || [];

      // Buscar itens de pedidos entregues
      const { data: itensPedidos, error: errorItens } = await supabase
        .from("pedidos_itens")
        .select("*")
        .in("pedido", pedidosEntreguesIds);

      if (errorItens) throw errorItens;

      // Calcular estoque por peça
      const estoqueMap = new Map<string, any>();

      // Adicionar entradas (produtos acabados)
      produtosAcabados?.forEach(produto => {
        const key = produto.id_peca;
        
        if (!estoqueMap.has(key)) {
          estoqueMap.set(key, {
            id_peca: produto.id_peca,
            descricao: produto.descricao,
            cores: new Map(),
            tamanhos: new Set(),
          });
        }

        const item = estoqueMap.get(key);
        if (!item.cores.has(produto.cor)) {
          item.cores.set(produto.cor, { PP: 0, P: 0, M: 0, G: 0, GG: 0 });
        }

        const corData = item.cores.get(produto.cor);
        corData.PP += produto.qtd_pp || 0;
        corData.P += produto.qtd_p || 0;
        corData.M += produto.qtd_m || 0;
        corData.G += produto.qtd_g || 0;
        corData.GG += produto.qtd_gg || 0;
      });

      // Subtrair saídas (itens de pedidos entregues)
      itensPedidos?.forEach(item => {
        const key = item.id_peca;
        
        if (estoqueMap.has(key)) {
          const estoqueItem = estoqueMap.get(key);
          
          if (estoqueItem.cores.has(item.cor)) {
            const corData = estoqueItem.cores.get(item.cor);
            corData.PP -= item.qtd_pp || 0;
            corData.P -= item.qtd_p || 0;
            corData.M -= item.qtd_m || 0;
            corData.G -= item.qtd_g || 0;
            corData.GG -= item.qtd_gg || 0;
          }
        }
      });

      // Buscar pedidos em aberto (reservas por cliente)
      const { data: pedidosAbertos, error: errorPedidosAbertos } = await supabase
        .from("pedidos")
        .select("pedido, cliente, status")
        .neq("status", "Entregue");

      if (errorPedidosAbertos) throw errorPedidosAbertos;

      const pedidosAbertosIds = pedidosAbertos?.map((p) => p.pedido) || [];

      const { data: itensAbertos, error: errorItensAbertos } = await supabase
        .from("pedidos_itens")
        .select("pedido, id_peca, total")
        .in("pedido", pedidosAbertosIds);

      if (errorItensAbertos) throw errorItensAbertos;

      // Mapa de reservas por peça -> cliente -> total
      const reservasPorPeca = new Map<string, Map<string, number>>();
      const clientePorPedido = new Map<string, string>();
      pedidosAbertos?.forEach((p) => clientePorPedido.set(p.pedido, p.cliente));

      itensAbertos?.forEach((it) => {
        const cli = clientePorPedido.get(it.pedido);
        if (!cli) return;
        if (!reservasPorPeca.has(it.id_peca)) reservasPorPeca.set(it.id_peca, new Map());
        const m = reservasPorPeca.get(it.id_peca)!;
        m.set(cli, (m.get(cli) || 0) + (it.total || 0));
      });

      // Processar e filtrar itens
      const itensEstoque: ItemEstoque[] = [];

      estoqueMap.forEach((item) => {
        let totalGeral = 0;
        const tamanhosDisponiveis = new Set<string>();
        const coresDisponiveis = new Set<string>();

        item.cores.forEach((qtds: any, cor: string) => {
          let totalCor = 0;

          ["PP", "P", "M", "G", "GG"].forEach(tamanho => {
            const qtd = qtds[tamanho];
            if (qtd > 0) {
              tamanhosDisponiveis.add(tamanho);
              totalCor += qtd;
            }
          });

          if (totalCor > 0) {
            coresDisponiveis.add(cor);
            totalGeral += totalCor;
          }
        });

        if (totalGeral > 0) {
          const reservasMap = reservasPorPeca.get(item.id_peca);
          const reservasArr = reservasMap
            ? Array.from(reservasMap.entries()).map(([cliente, total]) => ({ cliente, total }))
            : [];
          const totalReservado = reservasArr.reduce((s, r) => s + r.total, 0);

          itensEstoque.push({
            id_peca: item.id_peca,
            descricao: item.descricao,
            tamanhos: Array.from(tamanhosDisponiveis),
            cores: Array.from(coresDisponiveis),
            total: totalGeral,
            reservas: reservasArr,
            totalReservado,
          });
        }
      });

      setEstoque(itensEstoque);
    } catch (error) {
      console.error("Erro ao calcular estoque:", error);
      toast.error("Erro ao calcular estoque");
    } finally {
      setLoading(false);
    }
  };

  const itensFiltrados = estoque.filter(
    (item) =>
      item.id_peca.toLowerCase().includes(busca.toLowerCase()) ||
      item.descricao.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Estoque</h1>
          <p className="text-muted-foreground mt-1">
            Consulte a disponibilidade de produtos
          </p>
        </div>

        <Card className="p-4">
          <div className="space-y-2">
            <Label htmlFor="busca">Buscar por ID ou Descrição</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="busca"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Digite para buscar..."
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Calculando estoque...</p>
          </Card>
        ) : itensFiltrados.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              {busca ? "Nenhum item encontrado" : "Nenhum item em estoque"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {itensFiltrados.map((item) => (
              <Card key={item.id_peca} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ID Peça</p>
                    <p className="font-semibold">{item.id_peca}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="font-semibold">{item.descricao}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tamanhos disponíveis</p>
                    <p className="font-medium">{item.tamanhos.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cores disponíveis</p>
                    <p className="font-medium">{item.cores.join(", ")}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total em estoque</p>
                    <p className="text-2xl font-bold text-primary">{item.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reservado (clientes)</p>
                    {item.reservas && item.reservas.length > 0 ? (
                      <div>
                        <p className="font-semibold">{item.totalReservado}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.reservas.map((r) => `${r.cliente}: ${r.total}`).join(" | ")}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium">Nenhuma reserva</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Estoque;
