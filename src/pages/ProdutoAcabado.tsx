import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// gera data de hoje no formato YYYY-MM-DD
function hojeISO() {
  const d = new Date();
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

const ProdutoAcabado = () => {
  // Campos gerais do formulário
  const [data, setData] = useState<string>(hojeISO());
  const [idCorte, setIdCorte] = useState<string>("");
  const [idPeca, setIdPeca] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  // Linha atual que o usuário está preenchendo
  const [lancamentoAtual, setLancamentoAtual] = useState({
    cor: "",
    pp: 0,
    p: 0,
    m: 0,
    g: 0,
    gg: 0,
  });

  // Todas as linhas já adicionadas
  const [lancamentos, setLancamentos] = useState<
    Array<{
      cor: string;
      pp: number;
      p: number;
      m: number;
      g: number;
      gg: number;
    }>
  >([]);

  // Adiciona a linha atual na lista
  const adicionarLancamento = () => {
    if (!lancamentoAtual.cor.trim()) {
      toast.error("Informe a cor antes de adicionar.");
      return;
    }

    const totalQtd =
      Number(lancamentoAtual.pp || 0) +
      Number(lancamentoAtual.p || 0) +
      Number(lancamentoAtual.m || 0) +
      Number(lancamentoAtual.g || 0) +
      Number(lancamentoAtual.gg || 0);

    if (totalQtd === 0) {
      toast.error("Todas as quantidades estão zeradas.");
      return;
    }

    setLancamentos((prev) => [...prev, { ...lancamentoAtual }]);

    // limpa a linha atual para próxima cor
    setLancamentoAtual({
      cor: "",
      pp: 0,
      p: 0,
      m: 0,
      g: 0,
      gg: 0,
    });

    toast.success("Lançamento adicionado!");
  };

  const removerLancamento = (index: number) => {
    setLancamentos((prev) => prev.filter((_, i) => i !== index));
  };

  // Limpar tudo
  const limparFormulario = () => {
    setData(hojeISO());
    setIdCorte("");
    setIdPeca("");
    setDescricao("");
    setObservacoes("");
    setLancamentos([]);
    setLancamentoAtual({
      cor: "",
      pp: 0,
      p: 0,
      m: 0,
      g: 0,
      gg: 0,
    });
  };

  // Enviar para o banco
  // -> alinhado com o schema real da tabela produto_acabado:
  //    data, id_corte, id_peca, descricao, cor,
  //    qtd_pp, qtd_p, qtd_m, qtd_g, qtd_gg, total, obs
  const registrar = async () => {
    if (!idPeca.trim() || !descricao.trim()) {
      toast.error("Preencha ID Peça e Descrição.");
      return;
    }

    if (lancamentos.length === 0) {
      toast.error("Adicione pelo menos um lançamento de cor/tamanhos.");
      return;
    }

    // Monta cada linha já no formato da tabela
    const linhasParaInserir = lancamentos.map((lan) => {
      const qtd_pp = Number(lan.pp || 0);
      const qtd_p = Number(lan.p || 0);
      const qtd_m = Number(lan.m || 0);
      const qtd_g = Number(lan.g || 0);
      const qtd_gg = Number(lan.gg || 0);

      const total =
        qtd_pp + qtd_p + qtd_m + qtd_g + qtd_gg;

      return {
        data: data,                     // coluna "data"
        id_corte: idCorte || null,      // coluna "id_corte"
        id_peca: idPeca,                // coluna "id_peca"
        descricao: descricao,           // coluna "descricao"
        cor: lan.cor,                   // coluna "cor"
        qtd_pp,                         // coluna "qtd_pp"
        qtd_p,                          // coluna "qtd_p"
        qtd_m,                          // coluna "qtd_m"
        qtd_g,                          // coluna "qtd_g"
        qtd_gg,                         // coluna "qtd_gg"
        total,                          // coluna "total"
        obs: observacoes || "",         // coluna "obs"
        // id e created_at são gerados pelo banco
      };
    });

    console.log("Linhas que vão pro banco:", linhasParaInserir);

    try {
      const { data: resp, error } = await supabase
        .from("produto_acabado")
        .insert(linhasParaInserir)
        .select("*");

      if (error) {
        console.error("Erro ao registrar produto acabado:", error);
        toast.error("Erro ao registrar produto acabado");
        return;
      }

      toast.success("Produto acabado registrado com sucesso!");
      console.log("Resposta do banco:", resp);
      limparFormulario();
    } catch (err) {
      console.error("Falha inesperada:", err);
      toast.error("Falha inesperada ao registrar.");
    }
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Produto Acabado</h1>
          <p className="text-muted-foreground">
            Lançar produtos finalizados
          </p>
        </div>

        <Card className="p-4 md:p-6 space-y-6">
          {/* Dados gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data */}
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>

            {/* ID Corte */}
            <div className="space-y-2">
              <Label>ID Corte (opcional)</Label>
              <Input
                placeholder="Ex: 15"
                value={idCorte}
                onChange={(e) => setIdCorte(e.target.value)}
              />
            </div>

            {/* ID Peça */}
            <div className="space-y-2">
              <Label>ID Peça *</Label>
              <Input
                placeholder="Ex: 312154"
                value={idPeca}
                onChange={(e) => setIdPeca(e.target.value)}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                placeholder="Ex: camisa"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
          </div>

          {/* Bloco de lançamentos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Lançamentos</Label>

              <Button
                type="button"
                size="sm"
                onClick={adicionarLancamento}
                className="flex items-center gap-2"
              >
                <span>+</span>
                <span>Adicionar</span>
              </Button>
            </div>

            {/* Linha atual a adicionar */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              {/* Cor */}
              <div className="space-y-2 md:col-span-2">
                <Label>Cor *</Label>
                <Input
                  placeholder="Ex: azul"
                  value={lancamentoAtual.cor}
                  onChange={(e) =>
                    setLancamentoAtual((prev) => ({
                      ...prev,
                      cor: e.target.value,
                    }))
                  }
                />
              </div>

              {/* PP */}
              <div className="space-y-2">
                <Label>PP</Label>
                <Input
                  type="number"
                  min={0}
                  value={lancamentoAtual.pp}
                  onChange={(e) =>
                    setLancamentoAtual((prev) => ({
                      ...prev,
                      pp: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              {/* P */}
              <div className="space-y-2">
                <Label>P</Label>
                <Input
                  type="number"
                  min={0}
                  value={lancamentoAtual.p}
                  onChange={(e) =>
                    setLancamentoAtual((prev) => ({
                      ...prev,
                      p: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              {/* M */}
              <div className="space-y-2">
                <Label>M</Label>
                <Input
                  type="number"
                  min={0}
                  value={lancamentoAtual.m}
                  onChange={(e) =>
                    setLancamentoAtual((prev) => ({
                      ...prev,
                      m: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              {/* G */}
              <div className="space-y-2">
                <Label>G</Label>
                <Input
                  type="number"
                  min={0}
                  value={lancamentoAtual.g}
                  onChange={(e) =>
                    setLancamentoAtual((prev) => ({
                      ...prev,
                      g: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>

              {/* GG */}
              <div className="space-y-2">
                <Label>GG</Label>
                <Input
                  type="number"
                  min={0}
                  value={lancamentoAtual.gg}
                  onChange={(e) =>
                    setLancamentoAtual((prev) => ({
                      ...prev,
                      gg: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            </div>

            {/* Lista de lançamentos adicionados */}
            {lancamentos.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Itens adicionados
                </Label>

                <div className="space-y-2">
                  {lancamentos.map((item, index) => {
                    const total =
                      (item.pp || 0) +
                      (item.p || 0) +
                      (item.m || 0) +
                      (item.g || 0) +
                      (item.gg || 0);

                    return (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-3 rounded border p-3 text-sm"
                      >
                        <div className="font-medium">
                          {item.cor} (Total {total})
                        </div>
                        <div>PP: {item.pp}</div>
                        <div>P: {item.p}</div>
                        <div>M: {item.m}</div>
                        <div>G: {item.g}</div>
                        <div>GG: {item.gg}</div>

                        <Button
                          size="sm"
                          variant="destructive"
                          type="button"
                          onClick={() => removerLancamento(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>

          {/* Botões finais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={limparFormulario}
            >
              Limpar
            </Button>

            <Button
              type="button"
              onClick={registrar}
              className="w-full"
            >
              Registrar
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ProdutoAcabado;
