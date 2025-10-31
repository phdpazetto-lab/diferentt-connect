export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cortes: {
        Row: {
          cor: string
          created_at: string | null
          data: string
          descricao: string
          folhas: number
          grade_g: number
          grade_gg: number
          grade_m: number
          grade_p: number
          grade_pp: number
          id: string
          id_corte: string
          id_peca: string
          obs: string | null
          qtd_g: number
          qtd_gg: number
          qtd_m: number
          qtd_p: number
          qtd_pp: number
          qtd_total: number
        }
        Insert: {
          cor: string
          created_at?: string | null
          data?: string
          descricao: string
          folhas?: number
          grade_g?: number
          grade_gg?: number
          grade_m?: number
          grade_p?: number
          grade_pp?: number
          id?: string
          id_corte: string
          id_peca: string
          obs?: string | null
          qtd_g?: number
          qtd_gg?: number
          qtd_m?: number
          qtd_p?: number
          qtd_pp?: number
          qtd_total?: number
        }
        Update: {
          cor?: string
          created_at?: string | null
          data?: string
          descricao?: string
          folhas?: number
          grade_g?: number
          grade_gg?: number
          grade_m?: number
          grade_p?: number
          grade_pp?: number
          id?: string
          id_corte?: string
          id_peca?: string
          obs?: string | null
          qtd_g?: number
          qtd_gg?: number
          qtd_m?: number
          qtd_p?: number
          qtd_pp?: number
          qtd_total?: number
        }
        Relationships: []
      }
      parametros: {
        Row: {
          chave: string
          created_at: string | null
          valor: string
        }
        Insert: {
          chave: string
          created_at?: string | null
          valor: string
        }
        Update: {
          chave?: string
          created_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      pecas: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          id_peca: string
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          id_peca: string
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          id_peca?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente: string
          created_at: string | null
          data_entrada: string
          data_entrega: string | null
          data_prevista: string | null
          id: string
          obs: string | null
          pedido: string
          status: string
        }
        Insert: {
          cliente: string
          created_at?: string | null
          data_entrada?: string
          data_entrega?: string | null
          data_prevista?: string | null
          id?: string
          obs?: string | null
          pedido: string
          status?: string
        }
        Update: {
          cliente?: string
          created_at?: string | null
          data_entrada?: string
          data_entrega?: string | null
          data_prevista?: string | null
          id?: string
          obs?: string | null
          pedido?: string
          status?: string
        }
        Relationships: []
      }
      pedidos_itens: {
        Row: {
          cor: string
          created_at: string | null
          descricao: string
          id: string
          id_peca: string
          pedido: string
          qtd_g: number
          qtd_gg: number
          qtd_m: number
          qtd_p: number
          qtd_pp: number
          total: number
        }
        Insert: {
          cor: string
          created_at?: string | null
          descricao: string
          id?: string
          id_peca: string
          pedido: string
          qtd_g?: number
          qtd_gg?: number
          qtd_m?: number
          qtd_p?: number
          qtd_pp?: number
          total?: number
        }
        Update: {
          cor?: string
          created_at?: string | null
          descricao?: string
          id?: string
          id_peca?: string
          pedido?: string
          qtd_g?: number
          qtd_gg?: number
          qtd_m?: number
          qtd_p?: number
          qtd_pp?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_itens_pedido_fkey"
            columns: ["pedido"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["pedido"]
          },
        ]
      }
      produto_acabado: {
        Row: {
          cor: string
          created_at: string | null
          data: string
          descricao: string
          id: string
          id_corte: string | null
          id_peca: string
          obs: string | null
          qtd_g: number
          qtd_gg: number
          qtd_m: number
          qtd_p: number
          qtd_pp: number
          total: number
        }
        Insert: {
          cor: string
          created_at?: string | null
          data?: string
          descricao: string
          id?: string
          id_corte?: string | null
          id_peca: string
          obs?: string | null
          qtd_g?: number
          qtd_gg?: number
          qtd_m?: number
          qtd_p?: number
          qtd_pp?: number
          total?: number
        }
        Update: {
          cor?: string
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          id_corte?: string | null
          id_peca?: string
          obs?: string | null
          qtd_g?: number
          qtd_gg?: number
          qtd_m?: number
          qtd_p?: number
          qtd_pp?: number
          total?: number
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean
          created_at: string | null
          id: string
          nome: string
          perfil: string
          perm_admin: boolean
          perm_consulta: boolean
          perm_corte: boolean
          perm_pedidos: boolean
          perm_prod_acabado: boolean
          senha: string
          senha_hash: string | null
        }
        Insert: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome: string
          perfil?: string
          perm_admin?: boolean
          perm_consulta?: boolean
          perm_corte?: boolean
          perm_pedidos?: boolean
          perm_prod_acabado?: boolean
          senha: string
          senha_hash?: string | null
        }
        Update: {
          ativo?: boolean
          created_at?: string | null
          id?: string
          nome?: string
          perfil?: string
          perm_admin?: boolean
          perm_consulta?: boolean
          perm_corte?: boolean
          perm_pedidos?: boolean
          perm_prod_acabado?: boolean
          senha?: string
          senha_hash?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
