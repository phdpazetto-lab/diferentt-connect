import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Usuario {
  nome: string;
  perfil: string;
  perm_corte: boolean;
  perm_prod_acabado: boolean;
  perm_pedidos: boolean;
  perm_consulta: boolean;
  perm_admin: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const usuarioData = sessionStorage.getItem("usuario");
    if (!usuarioData) {
      navigate("/");
      return;
    }
    setUsuario(JSON.parse(usuarioData));
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("usuario");
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const menuItems = [
    {
      label: "Home",
      path: "/home",
      show: true
    },
    {
      label: "Corte",
      path: "/corte",
      show: usuario?.perm_corte
    },
    {
      label: "Produto Acabado",
      path: "/produto-acabado",
      show: usuario?.perm_prod_acabado
    },
    {
      label: "Pedidos",
      path: "/pedidos",
      show: usuario?.perm_pedidos
    },
    {
      label: "Situação & KPIs",
      path: "/situacao",
      show: usuario?.perm_pedidos
    },
    {
      label: "Estoque",
      path: "/estoque",
      show: usuario?.perm_consulta
    },
  ];

  const MenuContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-primary">Menu</h2>
        <p className="text-sm text-muted-foreground mt-1">{usuario?.perfil}</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(
          (item) =>
            item.show && (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                {item.label}
              </Button>
            )
        )}
      </nav>
    </div>
  );

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-card border-b h-16 flex items-center px-4 gap-4">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <MenuContent />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/home")}
            className="
      text-base font-semibold tracking-[0.4em]
      text-gray-600
      bg-transparent
      hover:bg-transparent hover:text-gray-900
      active:bg-transparent active:text-gray-900
      focus-visible:ring-0
      select-none
      transition-transform
      duration-05s
      hover:scale-105 active:scale-105
    "
          >
            D I F E R E N T T
          </Button>
        </div>



        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
};

export default Layout;
