-- Criar tabela de usuários
CREATE TABLE public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  senha_hash TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  perfil TEXT NOT NULL DEFAULT 'Diretor',
  perm_corte BOOLEAN NOT NULL DEFAULT FALSE,
  perm_prod_acabado BOOLEAN NOT NULL DEFAULT FALSE,
  perm_pedidos BOOLEAN NOT NULL DEFAULT FALSE,
  perm_consulta BOOLEAN NOT NULL DEFAULT FALSE,
  perm_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de peças
CREATE TABLE public.pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_peca TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de cortes
CREATE TABLE public.cortes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  id_corte TEXT NOT NULL,
  id_peca TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cor TEXT NOT NULL,
  grade_pp INTEGER NOT NULL DEFAULT 0,
  grade_p INTEGER NOT NULL DEFAULT 0,
  grade_m INTEGER NOT NULL DEFAULT 0,
  grade_g INTEGER NOT NULL DEFAULT 0,
  grade_gg INTEGER NOT NULL DEFAULT 0,
  folhas INTEGER NOT NULL DEFAULT 0,
  qtd_pp INTEGER NOT NULL DEFAULT 0,
  qtd_p INTEGER NOT NULL DEFAULT 0,
  qtd_m INTEGER NOT NULL DEFAULT 0,
  qtd_g INTEGER NOT NULL DEFAULT 0,
  qtd_gg INTEGER NOT NULL DEFAULT 0,
  qtd_total INTEGER NOT NULL DEFAULT 0,
  obs TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de produto acabado
CREATE TABLE public.produto_acabado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  id_corte TEXT,
  id_peca TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cor TEXT NOT NULL,
  qtd_pp INTEGER NOT NULL DEFAULT 0,
  qtd_p INTEGER NOT NULL DEFAULT 0,
  qtd_m INTEGER NOT NULL DEFAULT 0,
  qtd_g INTEGER NOT NULL DEFAULT 0,
  qtd_gg INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  obs TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido TEXT NOT NULL UNIQUE,
  cliente TEXT NOT NULL,
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  data_prevista DATE,
  data_entrega DATE,
  status TEXT NOT NULL DEFAULT 'Aberto',
  obs TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de itens de pedidos
CREATE TABLE public.pedidos_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido TEXT NOT NULL,
  id_peca TEXT NOT NULL,
  descricao TEXT NOT NULL,
  cor TEXT NOT NULL,
  qtd_pp INTEGER NOT NULL DEFAULT 0,
  qtd_p INTEGER NOT NULL DEFAULT 0,
  qtd_m INTEGER NOT NULL DEFAULT 0,
  qtd_g INTEGER NOT NULL DEFAULT 0,
  qtd_gg INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  FOREIGN KEY (pedido) REFERENCES public.pedidos(pedido) ON DELETE CASCADE
);

-- Criar tabela de parâmetros
CREATE TABLE public.parametros (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_acabado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parametros ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acesso autenticado)
CREATE POLICY "Usuários podem ver todos os dados de usuários"
  ON public.usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Acesso total a peças"
  ON public.pecas FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total a cortes"
  ON public.cortes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total a produto acabado"
  ON public.produto_acabado FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total a pedidos"
  ON public.pedidos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total a itens de pedidos"
  ON public.pedidos_itens FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Acesso total a parâmetros"
  ON public.parametros FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir usuário diretor padrão
INSERT INTO public.usuarios (nome, senha, ativo, perfil, perm_corte, perm_prod_acabado, perm_pedidos, perm_consulta, perm_admin)
VALUES ('diretor', 'mudar123', TRUE, 'Diretor', TRUE, TRUE, TRUE, TRUE, TRUE);

-- Inserir parâmetro empresa
INSERT INTO public.parametros (chave, valor)
VALUES ('empresa', 'Diferentt');