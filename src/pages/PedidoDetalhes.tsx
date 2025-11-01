import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type Qtds = { PP: number; P: number; M: number; G: number; GG: number };

interface PedidoRec {
  pedido: string;
  cliente: string;
}

const emptyQtds = (): Qtds => ({ PP: 0, P: 0, M: 0, G: 0, GG: 0 });

const PedidoDetalhes = () => {
  const { pedido } = useParams();
  const [pedidoRec, setPedidoRec] = useState<PedidoRec | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedido]);

  const carregar = async () => {
    if (!pedido) return;
    setLoading(true);
    setErro(null);
    try {
      const { data: ped, error: errPed } = await supabase
        .from("pedidos")
        .select("pedido, cliente")
        .eq("pedido", pedido)
        .single();
      if (errPed) throw errPed;
      setPedidoRec(ped);

      const { data: itens, error: errItens } = await supabase
        .from("pedidos_itens")
        .select("id_peca, descricao, cor, qtd_pp, qtd_p, qtd_m, qtd_g, qtd_gg, total")
        .eq("pedido", pedido);
      if (errItens) throw errItens;

      const refs = Array.from(new Set((itens || []).map((i) => i.id_peca)));

      const { data: producao, error: errProd } = await supabase
        .from("produto_acabado")
        .select("id_peca, cliente, cor, qtd_pp, qtd_p, qtd_m, qtd_g, qtd_gg, total")
        .eq("cliente", ped.cliente)
        .in("id_peca", refs);
      if (errProd) throw errProd;

      // Estruturar por referência -> cor -> qtds
      const porRef: Record<string, { descricao: string; pedidoTotal: number; produzidoTotal: number; cores: Record<string, { pedido: Qtds; produzido: Qtds }> }> = {};

      (itens || []).forEach((it: any) => {
        if (!porRef[it.id_peca]) {
          porRef[it.id_peca] = {
            descricao: it.descricao,
            pedidoTotal: 0,
            produzidoTotal: 0,
            cores: {},
          };
        }
        const cor = it.cor || "(todas)";
        if (!porRef[it.id_peca].cores[cor]) {
          porRef[it.id_peca].cores[cor] = { pedido: emptyQtds(), produzido: emptyQtds() };
        }
        const q = porRef[it.id_peca].cores[cor].pedido;
        q.PP += it.qtd_pp || 0;
        q.P += it.qtd_p || 0;
        q.M += it.qtd_m || 0;
        q.G += it.qtd_g || 0;
        q.GG += it.qtd_gg || 0;
        porRef[it.id_peca].pedidoTotal += it.total || 0;
      });

      (producao || []).forEach((p: any) => {
        // se o pedido tiver cor especificada, casamos; senão acumulamos em "(todas)"
        const ref = p.id_peca;
        if (!porRef[ref]) return; // produção de outra referência não pedida
        const temCorNoPedido = Object.keys(porRef[ref].cores).some((c) => c !== "(todas)");
        const corKey = temCorNoPedido ? p.cor || "" : "(todas)";
        if (!porRef[ref].cores[corKey]) {
          porRef[ref].cores[corKey] = { pedido: emptyQtds(), produzido: emptyQtds() };
        }
        const q = porRef[ref].cores[corKey].produzido;
        q.PP += p.qtd_pp || 0;
        q.P += p.qtd_p || 0;
        q.M += p.qtd_m || 0;
        q.G += p.qtd_g || 0;
        q.GG += p.qtd_gg || 0;
        porRef[ref].produzidoTotal += p.total || 0;
      });

      setDados(porRef);
    } catch (e: any) {
      console.error(e);
      setErro("Erro ao carregar detalhes do pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Detalhes do Pedido</h1>
            {pedidoRec && (
              <p className="text-muted-foreground text-sm">{pedidoRec.pedido} • {pedidoRec.cliente}</p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link to="/situacao">Voltar</Link>
          </Button>
        </div>

        {loading ? (
          <Card className="p-12 text-center">Carregando...</Card>
        ) : erro ? (
          <Card className="p-12 text-center">{erro}</Card>
        ) : !dados || Object.keys(dados).length === 0 ? (
          <Card className="p-12 text-center">Sem itens para exibir</Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(dados).map(([ref, info]: any) => {
              const falta = Math.max(0, info.pedidoTotal - info.produzidoTotal);
              const excesso = Math.max(0, info.produzidoTotal - info.pedidoTotal);
              return (
                <Card key={ref} className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{ref} — {info.descricao}</h3>
                      <p className="text-sm text-muted-foreground">
                        Produzido {info.produzidoTotal} de {info.pedidoTotal} {falta > 0 ? `(Falta ${falta})` : excesso > 0 ? `(Excesso ${excesso})` : ""}
                      </p>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cor</TableHead>
                        <TableHead className="text-right">PP</TableHead>
                        <TableHead className="text-right">P</TableHead>
                        <TableHead className="text-right">M</TableHead>
                        <TableHead className="text-right">G</TableHead>
                        <TableHead className="text-right">GG</TableHead>
                        <TableHead className="text-right">Total Pedido</TableHead>
                        <TableHead className="text-right">Total Produzido</TableHead>
                        <TableHead className="text-right">Diferença</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(info.cores).map(([cor, dadosCor]: any) => {
                        const totalPed = dadosCor.pedido.PP + dadosCor.pedido.P + dadosCor.pedido.M + dadosCor.pedido.G + dadosCor.pedido.GG;
                        const totalProd = dadosCor.produzido.PP + dadosCor.produzido.P + dadosCor.produzido.M + dadosCor.produzido.G + dadosCor.produzido.GG;
                        const diff = totalProd - totalPed;
                        return (
                          <TableRow key={cor}>
                            <TableCell className="font-medium">{cor}</TableCell>
                            <TableCell className="text-right">{dadosCor.pedido.PP} / {dadosCor.produzido.PP}</TableCell>
                            <TableCell className="text-right">{dadosCor.pedido.P} / {dadosCor.produzido.P}</TableCell>
                            <TableCell className="text-right">{dadosCor.pedido.M} / {dadosCor.produzido.M}</TableCell>
                            <TableCell className="text-right">{dadosCor.pedido.G} / {dadosCor.produzido.G}</TableCell>
                            <TableCell className="text-right">{dadosCor.pedido.GG} / {dadosCor.produzido.GG}</TableCell>
                            <TableCell className="text-right">{totalPed}</TableCell>
                            <TableCell className="text-right">{totalProd}</TableCell>
                            <TableCell className="text-right">{diff}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PedidoDetalhes;

