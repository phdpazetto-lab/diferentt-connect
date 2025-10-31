import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Scissors, Package, ShoppingCart, BarChart3, Archive } from "lucide-react";

interface Usuario {
  perm_corte: boolean;
  perm_prod_acabado: boolean;
  perm_pedidos: boolean;
  perm_consulta: boolean;
}

const Home = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioData = sessionStorage.getItem("usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    }
  }, []);

  const cards = [
    {
      title: "Corte",
      description: "Registrar novos cortes",
      icon: Scissors,
      path: "/corte",
      show: usuario?.perm_corte,
      color: "bg-primary",
    },
    {
      title: "Produto Acabado",
      description: "Lançar produtos finalizados",
      icon: Package,
      path: "/produto-acabado",
      show: usuario?.perm_prod_acabado,
      color: "bg-success",
    },
    {
      title: "Pedidos",
      description: "Gerenciar pedidos de clientes",
      icon: ShoppingCart,
      path: "/pedidos",
      show: usuario?.perm_pedidos,
      color: "bg-accent",
    },
    {
      title: "Situação & KPIs",
      description: "Acompanhar status dos pedidos",
      icon: BarChart3,
      path: "/situacao",
      show: usuario?.perm_pedidos,
      color: "bg-warning",
    },
    {
      title: "Estoque",
      description: "Consultar disponibilidade",
      icon: Archive,
      path: "/estoque",
      show: usuario?.perm_consulta,
      color: "bg-muted",
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo</h1>
          <p className="text-muted-foreground mt-1">
            Selecione uma opção para começar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(
            (card) =>
              card.show && (
                <Card
                  key={card.path}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(card.path)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{card.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </Card>
              )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
