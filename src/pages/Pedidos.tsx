import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ItemPedido {
  id_peca: string;
  descricao: string;
  cor: string;
  qtd_pp: number;
  qtd_p: number;
  qtd_m: number;
  qtd_g: number;
  qtd_gg: number;
}

const Pedidos = () => {
  const hoje = new Date().toISOString().split("T")[0];
  
  const [pedido, setPedido] = useState("");
  const [cliente, setCliente] = useState("");
  const [dataEntrada, setDataEntrada] = useState(hoje);
  const [dataPrevista, setDataPrevista] = useState("");
  const [status] = useState("Aberto");
  const [obs, setObs] = useState("");
  const [itens, setItens] = useState<ItemPedido[]>([
    { id_peca: "", descricao: "", cor: "", qtd_pp: 0, qtd_p: 0, qtd_m: 0, qtd_g: 0, qtd_gg: 0 },
  ]);
  const [coresSugeridas, setCoresSugeridas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarCores();
  }, []);

  const carregarCores = async () => {
    try {
      const { data, error } = await supabase
        .from("cortes")
        .select("cor")
        .order("cor");

      if (error) throw error;

      const cores = [...new Set(data?.map(c => c.cor) || [])];
      setCoresSugeridas(cores);
    } catch (error) {
      console.error("Erro ao carregar cores:", error);
    }
  };

  const adicionarItem = () => {
    setItens([
      ...itens,
      { id_peca: "", descricao: "", cor: "", qtd_pp: 0, qtd_p: 0, qtd_m: 0, qtd_g: 0, qtd_gg: 0 },
    ]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const atualizarItem = (index: number, campo: keyof ItemPedido, valor: string | number) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setItens(novosItens);
  };

  const limpar = () => {
    setPedido("");
    setCliente("");
    setDataEntrada(hoje);
    setDataPrevista("");
    setObs("");
    setItens([
      { id_peca: "", descricao: "", cor: "", qtd_pp: 0, qtd_p: 0, qtd_m: 0, qtd_g: 0, qtd_gg: 0 },
    ]);
  };

  const registrar = async () => {
    if (!cliente || itens.some(i => !i.id_peca || !i.descricao)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // Gerar ID do pedido se vazio
      const idPedido = pedido || `PED-${Date.now()}`;

      // Inserir pedido
      const { error: pedidoError } = await supabase.from("pedidos").insert({
        pedido: idPedido,
        cliente,
        data_entrada: dataEntrada,
        data_prevista: dataPrevista || null,
        status,
        obs,
      });

      if (pedidoError) throw pedidoError;

      // Inserir itens
      for (const item of itens) {
        const total = item.qtd_pp + item.qtd_p + item.qtd_m + item.qtd_g + item.qtd_gg;

        const { error: itemError } = await supabase.from("pedidos_itens").insert({
          pedido: idPedido,
          id_peca: item.id_peca,
          descricao: item.descricao,
          cor: item.cor,
          qtd_pp: item.qtd_pp,
          qtd_p: item.qtd_p,
          qtd_m: item.qtd_m,
          qtd_g: item.qtd_g,
          qtd_gg: item.qtd_gg,
          total,
        });

        if (itemError) throw itemError;
      }

      toast.success("Pedido registrado com sucesso!");
      limpar();
    } catch (error) {
      console.error("Erro ao registrar pedido:", error);
      toast.error("Erro ao registrar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciar pedidos de clientes
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pedido">ID Pedido (opcional)</Label>
              <Input
                id="pedido"
                value={pedido}
                onChange={(e) => setPedido(e.target.value)}
                placeholder="Auto-gerado se vazio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente *</Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataEntrada">Data Entrada</Label>
              <Input
                id="dataEntrada"
                type="date"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataPrevista">Data Prevista</Label>
              <Input
                id="dataPrevista"
                type="date"
                value={dataPrevista}
                onChange={(e) => setDataPrevista(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Itens do Pedido</h3>
              <Button type="button" size="sm" onClick={adicionarItem}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {itens.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removerItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>ID Peça *</Label>
                      <Input
                        value={item.id_peca}
                        onChange={(e) =>
                          atualizarItem(index, "id_peca", e.target.value)
                        }
                        placeholder="Ex: P001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição *</Label>
                      <Input
                        value={item.descricao}
                        onChange={(e) =>
                          atualizarItem(index, "descricao", e.target.value)
                        }
                        placeholder="Ex: Camiseta"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <Input
                        value={item.cor}
                        onChange={(e) =>
                          atualizarItem(index, "cor", e.target.value)
                        }
                        placeholder="Ex: Azul"
                        list={`cores-${index}`}
                      />
                      <datalist id={`cores-${index}`}>
                        {coresSugeridas.map((cor) => (
                          <option key={cor} value={cor} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    <div className="space-y-2">
                      <Label>PP</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.qtd_pp}
                        onChange={(e) =>
                          atualizarItem(index, "qtd_pp", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>P</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.qtd_p}
                        onChange={(e) =>
                          atualizarItem(index, "qtd_p", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>M</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.qtd_m}
                        onChange={(e) =>
                          atualizarItem(index, "qtd_m", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>G</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.qtd_g}
                        onChange={(e) =>
                          atualizarItem(index, "qtd_g", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GG</Label>
                      <Input
                        type="number"
                        min="0"
                        value={item.qtd_gg}
                        onChange={(e) =>
                          atualizarItem(index, "qtd_gg", Number(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={limpar} className="flex-1">
              Limpar
            </Button>
            <Button
              type="button"
              onClick={registrar}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Pedidos;
