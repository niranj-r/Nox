import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string;
          shipping_address: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone: string;
          shipping_address: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          shipping_address?: any;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          material: string;
          color: string;
          collection: string;
          stock_quantity: number;
          is_limited_edition: boolean;
          is_low_stock: boolean;
          primary_image: string;
          hover_image: string;
          detail_images: string[];
          created_at: string;
          updated_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_no: string;
          bill_id: string;
          status: string;
          total_amount: number;
          discount_code: string | null;
          discount_amount: number;
          final_amount: number;
          shipping_address: any;
          phone: string;
          payment_screenshot_url: string | null;
          created_at: string;
          updated_at: string;
          payment_confirmed_at: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          product_snapshot: any;
        };
      };
      discount_codes: {
        Row: {
          id: string;
          code: string;
          description: string;
          discount_type: string;
          discount_value: number;
          min_order_amount: number;
          max_uses: number | null;
          current_uses: number;
          valid_from: string;
          valid_until: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
      };
    };
  };
};
