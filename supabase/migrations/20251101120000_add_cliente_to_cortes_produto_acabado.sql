-- Add optional cliente field to cortes and produto_acabado
ALTER TABLE public.cortes
  ADD COLUMN IF NOT EXISTS cliente TEXT;

ALTER TABLE public.produto_acabado
  ADD COLUMN IF NOT EXISTS cliente TEXT;

