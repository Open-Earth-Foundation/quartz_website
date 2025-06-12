import { createClient } from "@supabase/supabase-js";

console.log("🔌 Supabase module loading...");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("🔧 Environment variables:", {
  supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
  supabaseAnonKey: supabaseAnonKey ? "✅ Set" : "❌ Missing",
  urlValue: supabaseUrl,
  keyValue: supabaseAnonKey
    ? `${supabaseAnonKey.substring(0, 10)}...`
    : "Not set",
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("💥 Missing Supabase environment variables");
  throw new Error("Missing Supabase environment variables");
}

console.log("🚀 Creating Supabase client...");
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("✅ Supabase client created successfully");

// Test the connection
console.log("🔍 Testing Supabase connection...");
supabase
  .from("environmental_report")
  .select("count", { count: "exact", head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error("💥 Supabase connection test failed:", error);
    } else {
      console.log(
        "✅ Supabase connection test successful, record count:",
        count
      );
    }
  });

// Database Types
export interface Database {
  public: {
    Tables: {
      environmental_report: {
        Row: {
          id: number;
          name: string;
          country: string;
          sector: string;
          url: string;
          human_eval: number;
          accepted: boolean;
          confidence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          country: string;
          sector: string;
          url: string;
          human_eval?: number;
          accepted?: boolean;
          confidence: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          country?: string;
          sector?: string;
          url?: string;
          human_eval?: number;
          accepted?: boolean;
          confidence?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
