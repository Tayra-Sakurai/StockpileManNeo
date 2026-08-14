export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined; }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
  public: {
    Tables: {
      barcode_data: {
        Row: {
          created_at: string;
          id: number;
          jan_code: string;
          location_id: number | null;
          name: string;
          small_category_id: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          jan_code: string;
          location_id?: number | null;
          name: string;
          small_category_id?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          jan_code?: string;
          location_id?: number | null;
          name?: string;
          small_category_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "barcode_data_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "barcode_data_small_category_id_fkey";
            columns: ["small_category_id"];
            isOneToOne: false;
            referencedRelation: "small_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      items: {
        Row: {
          barcode_id: number | null;
          created_at: string;
          description: string | null;
          id: number;
          life: string | null;
          location_id: number;
          name: string;
          purchase_timestamp: string;
          small_category_id: number;
          user_id: string;
          vector: number[];
        };
        Insert: {
          barcode_id?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          life?: string | null;
          location_id: number;
          name?: string;
          purchase_timestamp?: string;
          small_category_id: number;
          user_id?: string;
          vector: number[];
        };
        Update: {
          barcode_id?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          life?: string | null;
          location_id?: number;
          name?: string;
          purchase_timestamp?: string;
          small_category_id?: number;
          user_id?: string;
          vector?: number[];
        };
        Relationships: [
          {
            foreignKeyName: "items_barcode_id_fkey";
            columns: ["barcode_id"];
            isOneToOne: false;
            referencedRelation: "barcode_data";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_small_category_id_fkey";
            columns: ["small_category_id"];
            isOneToOne: false;
            referencedRelation: "small_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      large_categories: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          user_id: string;
          vector: number[];
        };
        Insert: {
          created_at?: string;
          id?: number;
          name: string;
          user_id?: string;
          vector: number[];
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          user_id?: string;
          vector?: number[];
        };
        Relationships: [];
      };
      locations: {
        Row: {
          created_at: string;
          id: number;
          name: string;
          user_id: string;
          vector: number[];
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string;
          user_id?: string;
          vector: number[];
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string;
          user_id?: string;
          vector?: number[];
        };
        Relationships: [];
      };
      small_categories: {
        Row: {
          created_at: string;
          id: number;
          large_category_id: number;
          name: string;
          user_id: string;
          vector: number[];
        };
        Insert: {
          created_at?: string;
          id?: number;
          large_category_id: number;
          name?: string;
          user_id?: string;
          vector: number[];
        };
        Update: {
          created_at?: string;
          id?: number;
          large_category_id?: number;
          name?: string;
          user_id?: string;
          vector?: number[];
        };
        Relationships: [
          {
            foreignKeyName: "small_categories_large_category_id_fkey";
            columns: ["large_category_id"];
            isOneToOne: false;
            referencedRelation: "large_categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      postgres_fdw_disconnect: { Args: { "": string; }; Returns: boolean; };
      postgres_fdw_disconnect_all: { Args: never; Returns: boolean; };
      postgres_fdw_get_connections: {
        Args: never;
        Returns: Record<string, unknown>[];
      };
      postgres_fdw_handler: { Args: never; Returns: unknown; };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals; },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals; },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals; },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals; },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals; },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
