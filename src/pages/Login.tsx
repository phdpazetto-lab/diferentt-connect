import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Tentando login com:", { nome, senha });
      
      // Buscar usuário
      const { data: usuario, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("nome", nome)
        .eq("ativo", true)
        .single();

      console.log("Resposta do banco:", { usuario, error });

      if (error) {
        console.error("Erro ao buscar usuário:", error);
        toast.error(`Erro: ${error.message}`);
        setLoading(false);
        return;
      }

      if (!usuario) {
        toast.error("Usuário não encontrado ou inativo");
        setLoading(false);
        return;
      }

      // Verificar senha
      const senhaValida = usuario.senha === senha;

      if (!senhaValida) {
        toast.error("Senha incorreta");
        setLoading(false);
        return;
      }

      // Salvar sessão
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
      toast.success("Login realizado com sucesso!");
      navigate("/home");
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">Diferentt</h1>
          <p className="text-muted-foreground">Sistema de Gestão</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome de Usuário</Label>
            <Input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
