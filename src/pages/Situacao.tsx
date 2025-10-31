import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Pedido {
  id: string;
  pedido: string;
  cliente: string;
  data_entrada: string;
  data_prevista: string | null;
  data_entrega: string | null;
  status: string;
  obs: string | null;
}

const Situacao = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("data_entrada", { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const marcarEntregue = async (id: string, pedido: string) => {
    try {
      const hoje = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("pedidos")
        .update({ data_entrega: hoje, status: "Entregue" })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Pedido ${pedido} marcado como entregue!`);
      carregarPedidos();
    } catch (error) {
      console.error("Erro ao marcar como entregue:", error);
      toast.error("Erro ao atualizar pedido");
    }
  };

  const calcularKPI = (pedido: Pedido) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (pedido.data_entrega) {
      // Já foi entregue
      if (!pedido.data_prevista) {
        return { label: "Entregue", color: "bg-success" };
      }

      const dataEntrega = new Date(pedido.data_entrega);
      const dataPrevista = new Date(pedido.data_prevista);

      if (dataEntrega <= dataPrevista) {
        return { label: "Entregue no prazo", color: "bg-success" };
      } else {
        return { label: "Entregue com atraso", color: "bg-destructive" };
      }
    }

    // Ainda não foi entregue
    if (!pedido.data_prevista) {
      return { label: "Sem prazo definido", color: "bg-muted" };
    }

    const dataPrevista = new Date(pedido.data_prevista);
    const diffDias = Math.ceil((dataPrevista.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDias < 0) {
      return { label: "Prazo estourado", color: "bg-destructive" };
    } else if (diffDias <= 2) {
      return { label: "Prazo se esgotando", color: "bg-warning" };
    } else {
      return { label: "Dentro do prazo", color: "bg-success" };
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return "-";
    return format(new Date(data), "dd/MM/yyyy");
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Situação & KPIs</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe o status de todos os pedidos
          </p>
        </div>

        {pedidos.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum pedido cadastrado ainda</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const kpi = calcularKPI(pedido);

              return (
                <Card key={pedido.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{pedido.pedido}</h3>
                          <p className="text-sm text-muted-foreground">{pedido.cliente}</p>
                        </div>
                        <Badge className={`${kpi.color} text-white`}>{kpi.label}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Entrada</p>
                          <p className="font-medium">{formatarData(pedido.data_entrada)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Prevista</p>
                          <p className="font-medium">{formatarData(pedido.data_prevista)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Entrega</p>
                          <p className="font-medium">{formatarData(pedido.data_entrega)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium">{pedido.status}</p>
                        </div>
                      </div>

                      {pedido.obs && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Observações:</p>
                          <p>{pedido.obs}</p>
                        </div>
                      )}
                    </div>

                    {!pedido.data_entrega && (
                      <Button
                        size="sm"
                        onClick={() => marcarEntregue(pedido.id, pedido.pedido)}
                        className="md:self-center"
                      >
                        Marcar entregue
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Situacao;
