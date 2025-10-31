import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface LancamentoItem {
  cor: string;
  tamanho: string;
  quantidade: number;
}

const ProdutoAcabado = () => {
  const hoje = new Date().toISOString().split("T")[0];
  
  const [data, setData] = useState(hoje);
  const [idCorte, setIdCorte] = useState("");
  const [idPeca, setIdPeca] = useState("");
  const [descricao, setDescricao] = useState("");
  const [lancamentos, setLancamentos] = useState<LancamentoItem[]>([
    { cor: "", tamanho: "PP", quantidade: 0 },
  ]);
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const tamanhos = ["PP", "P", "M", "G", "GG"];

  const adicionarLancamento = () => {
    setLancamentos([...lancamentos, { cor: "", tamanho: "PP", quantidade: 0 }]);
  };

  const removerLancamento = (index: number) => {
    setLancamentos(lancamentos.filter((_, i) => i !== index));
  };

  const atualizarLancamento = (
    index: number,
    campo: keyof LancamentoItem,
    valor: string | number
  ) => {
    const novosLancamentos = [...lancamentos];
    novosLancamentos[index] = { ...novosLancamentos[index], [campo]: valor };
    setLancamentos(novosLancamentos);
  };

  const limpar = () => {
    setData(hoje);
    setIdCorte("");
    setIdPeca("");
    setDescricao("");
    setLancamentos([{ cor: "", tamanho: "PP", quantidade: 0 }]);
    setObs("");
  };

  const registrar = async () => {
    if (!idPeca || !descricao || lancamentos.some(l => !l.cor)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // Agrupar por cor
      const agrupados = lancamentos.reduce((acc, item) => {
        if (!acc[item.cor]) {
          acc[item.cor] = { PP: 0, P: 0, M: 0, G: 0, GG: 0 };
        }
        acc[item.cor][item.tamanho as keyof typeof acc[string]] += item.quantidade;
        return acc;
      }, {} as Record<string, { PP: number; P: number; M: number; G: number; GG: number }>);

      // Inserir um registro para cada cor
      for (const [cor, tamanhos] of Object.entries(agrupados)) {
        const total = tamanhos.PP + tamanhos.P + tamanhos.M + tamanhos.G + tamanhos.GG;

        const { error } = await supabase.from("produto_acabado").insert({
          data,
          id_corte: idCorte || null,
          id_peca: idPeca,
          descricao,
          cor,
          qtd_pp: tamanhos.PP,
          qtd_p: tamanhos.P,
          qtd_m: tamanhos.M,
          qtd_g: tamanhos.G,
          qtd_gg: tamanhos.GG,
          total,
          obs,
        });

        if (error) throw error;
      }

      toast.success("Produto acabado registrado com sucesso!");
      limpar();
    } catch (error) {
      console.error("Erro ao registrar produto acabado:", error);
      toast.error("Erro ao registrar produto acabado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Produto Acabado</h1>
          <p className="text-muted-foreground mt-1">
            Lançar produtos finalizados
          </p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idCorte">ID Corte (opcional)</Label>
              <Input
                id="idCorte"
                value={idCorte}
                onChange={(e) => setIdCorte(e.target.value)}
                placeholder="Ex: C001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idPeca">ID Peça *</Label>
              <Input
                id="idPeca"
                value={idPeca}
                onChange={(e) => setIdPeca(e.target.value)}
                placeholder="Ex: P001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Camiseta Básica"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Lançamentos</h3>
              <Button type="button" size="sm" onClick={adicionarLancamento}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {lancamentos.map((lancamento, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label>Cor *</Label>
                    <Input
                      value={lancamento.cor}
                      onChange={(e) =>
                        atualizarLancamento(index, "cor", e.target.value)
                      }
                      placeholder="Ex: Azul Marinho"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Tamanho</Label>
                    <select
                      value={lancamento.tamanho}
                      onChange={(e) =>
                        atualizarLancamento(index, "tamanho", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {tamanhos.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min="0"
                      value={lancamento.quantidade}
                      onChange={(e) =>
                        atualizarLancamento(
                          index,
                          "quantidade",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  {lancamentos.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removerLancamento(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
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

export default ProdutoAcabado;
