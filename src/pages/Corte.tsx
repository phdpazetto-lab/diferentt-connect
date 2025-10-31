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

interface CorItem {
  cor: string;
  folhas: number;
}

const Corte = () => {
  const hoje = new Date().toISOString().split("T")[0];
  
  const [data, setData] = useState(hoje);
  const [idCorte, setIdCorte] = useState("");
  const [idPeca, setIdPeca] = useState("");
  const [descricao, setDescricao] = useState("");
  const [gradePP, setGradePP] = useState(0);
  const [gradeP, setGradeP] = useState(0);
  const [gradeM, setGradeM] = useState(0);
  const [gradeG, setGradeG] = useState(0);
  const [gradeGG, setGradeGG] = useState(0);
  const [cores, setCores] = useState<CorItem[]>([{ cor: "", folhas: 0 }]);
  const [obs, setObs] = useState("");
  const [loading, setLoading] = useState(false);

  const adicionarCor = () => {
    setCores([...cores, { cor: "", folhas: 0 }]);
  };

  const removerCor = (index: number) => {
    setCores(cores.filter((_, i) => i !== index));
  };

  const atualizarCor = (index: number, campo: keyof CorItem, valor: string | number) => {
    const novasCores = [...cores];
    novasCores[index] = { ...novasCores[index], [campo]: valor };
    setCores(novasCores);
  };

  const limpar = () => {
    setData(hoje);
    setIdCorte("");
    setIdPeca("");
    setDescricao("");
    setGradePP(0);
    setGradeP(0);
    setGradeM(0);
    setGradeG(0);
    setGradeGG(0);
    setCores([{ cor: "", folhas: 0 }]);
    setObs("");
  };

  const registrar = async () => {
    if (!idCorte || !idPeca || !descricao || cores.some(c => !c.cor)) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // Inserir um registro para cada cor
      for (const corItem of cores) {
        const qtdPP = corItem.folhas * gradePP;
        const qtdP = corItem.folhas * gradeP;
        const qtdM = corItem.folhas * gradeM;
        const qtdG = corItem.folhas * gradeG;
        const qtdGG = corItem.folhas * gradeGG;
        const qtdTotal = qtdPP + qtdP + qtdM + qtdG + qtdGG;

        const { error } = await supabase.from("cortes").insert({
          data,
          id_corte: idCorte,
          id_peca: idPeca,
          descricao,
          cor: corItem.cor,
          grade_pp: gradePP,
          grade_p: gradeP,
          grade_m: gradeM,
          grade_g: gradeG,
          grade_gg: gradeGG,
          folhas: corItem.folhas,
          qtd_pp: qtdPP,
          qtd_p: qtdP,
          qtd_m: qtdM,
          qtd_g: qtdG,
          qtd_gg: qtdGG,
          qtd_total: qtdTotal,
          obs,
        });

        if (error) throw error;
      }

      toast.success("Corte registrado com sucesso!");
      limpar();
    } catch (error) {
      console.error("Erro ao registrar corte:", error);
      toast.error("Erro ao registrar corte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Registro de fluxo</h1>
          <p className="text-muted-foreground mt-1">
            Preencha os dados do corte realizado
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
              <Label htmlFor="idCorte">ID Corte *</Label>
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
            <h3 className="font-semibold mb-3">Grade de Tamanhos</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradePP">PP</Label>
                <Input
                  id="gradePP"
                  type="number"
                  min="0"
                  value={gradePP}
                  onChange={(e) => setGradePP(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeP">P</Label>
                <Input
                  id="gradeP"
                  type="number"
                  min="0"
                  value={gradeP}
                  onChange={(e) => setGradeP(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeM">M</Label>
                <Input
                  id="gradeM"
                  type="number"
                  min="0"
                  value={gradeM}
                  onChange={(e) => setGradeM(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeG">G</Label>
                <Input
                  id="gradeG"
                  type="number"
                  min="0"
                  value={gradeG}
                  onChange={(e) => setGradeG(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeGG">GG</Label>
                <Input
                  id="gradeGG"
                  type="number"
                  min="0"
                  value={gradeGG}
                  onChange={(e) => setGradeGG(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Cores & Folhas</h3>
              <Button type="button" size="sm" onClick={adicionarCor}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Cor
              </Button>
            </div>

            <div className="space-y-3">
              {cores.map((corItem, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label>Cor *</Label>
                    <Input
                      value={corItem.cor}
                      onChange={(e) => atualizarCor(index, "cor", e.target.value)}
                      placeholder="Ex: Azul Marinho"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Folhas</Label>
                    <Input
                      type="number"
                      min="0"
                      value={corItem.folhas}
                      onChange={(e) => atualizarCor(index, "folhas", Number(e.target.value))}
                    />
                  </div>
                  {cores.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removerCor(index)}
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

export default Corte;
