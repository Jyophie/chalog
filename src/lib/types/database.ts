/**
 * Supabase 스키마 타입 (supabase/migrations/0001_init.sql 과 수동 동기화).
 * 추후 CLI 연결 시 `supabase gen types typescript` 로 자동 생성 대체 가능.
 */

export type TeaCategory =
  | "녹차"
  | "백차"
  | "황차"
  | "우롱차/청차"
  | "홍차"
  | "흑차/보이차"
  | "말차"
  | "블렌딩 티"
  | "허브티"
  | "잘 모르겠음";

export type LeafShape =
  | "길고 꼬여 있음"
  | "동그랗게 말려 있음"
  | "납작함"
  | "압축된 덩어리"
  | "가루 형태"
  | "티백"
  | "잘 모르겠음";

export type BrewingToolEnum =
  | "머그컵"
  | "티팟"
  | "개완"
  | "자사호"
  | "텀블러"
  | "잘 모르겠음";

export type ConfidenceLevel = "높음" | "중간" | "낮음";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
        Relationships: [];
      };
      teas: {
        Row: {
          id: string;
          user_id: string;
          tea_name: string | null;
          tea_category: TeaCategory | null;
          brand: string | null;
          origin: string | null;
          production_year: string | null;
          image_url: string | null;
          leaf_shape: LeafShape | null;
          is_compressed: boolean;
          brewing_tool: BrewingToolEnum | null;
          drinking_style: string | null;
          user_memo: string | null;
          ai_summary: string | null;
          confidence_level: ConfidenceLevel | null;
          extracted_text: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tea_name?: string | null;
          tea_category?: TeaCategory | null;
          brand?: string | null;
          origin?: string | null;
          production_year?: string | null;
          image_url?: string | null;
          leaf_shape?: LeafShape | null;
          is_compressed?: boolean;
          brewing_tool?: BrewingToolEnum | null;
          drinking_style?: string | null;
          user_memo?: string | null;
          ai_summary?: string | null;
          confidence_level?: ConfidenceLevel | null;
          extracted_text?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teas"]["Insert"]>;
        Relationships: [];
      };
      brewing_guides: {
        Row: {
          id: string;
          tea_id: string;
          water_temperature: string | null;
          tea_amount: string | null;
          steeping_time: string | null;
          recommended_tool: string | null;
          rinse_method: string | null;
          guide_text: string | null;
          adjustment_tips: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tea_id: string;
          water_temperature?: string | null;
          tea_amount?: string | null;
          steeping_time?: string | null;
          recommended_tool?: string | null;
          rinse_method?: string | null;
          guide_text?: string | null;
          adjustment_tips?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["brewing_guides"]["Insert"]
        >;
        Relationships: [];
      };
      tea_logs: {
        Row: {
          id: string;
          tea_id: string;
          user_id: string;
          brewed_at: string;
          photo_url: string | null;
          photo_paths: string[];
          water_temperature: string | null;
          tea_amount: string | null;
          steeping_time: string | null;
          tool: BrewingToolEnum | null;
          taste_memo: string | null;
          aroma_memo: string | null;
          bitterness_level: number | null;
          astringency_level: number | null;
          rating: number | null;
          next_adjustment: string | null;
          is_public: boolean;
          like_count: number;
          comment_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tea_id: string;
          user_id: string;
          brewed_at?: string;
          photo_url?: string | null;
          photo_paths?: string[];
          is_public?: boolean;
          like_count?: number;
          comment_count?: number;
          water_temperature?: string | null;
          tea_amount?: string | null;
          steeping_time?: string | null;
          tool?: BrewingToolEnum | null;
          taste_memo?: string | null;
          aroma_memo?: string | null;
          bitterness_level?: number | null;
          astringency_level?: number | null;
          rating?: number | null;
          next_adjustment?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tea_logs"]["Insert"]>;
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          log_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          log_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["likes"]["Insert"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          log_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          log_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      public_profiles: {
        Row: { id: string; display_name: string | null };
        Relationships: [];
      };
    };
    Functions: Record<never, never>;
    Enums: {
      tea_category: TeaCategory;
      leaf_shape: LeafShape;
      brewing_tool: BrewingToolEnum;
      confidence_level: ConfidenceLevel;
    };
  };
}
