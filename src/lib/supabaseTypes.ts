// Types for new Supabase tables
export interface Card {
  id: number;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
  in_stock: boolean;
  is_custom: boolean;
  created_at?: string;
}

export interface Review {
  id: number;
  product_id: number;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at?: string;
}

export interface Fundraiser {
  id: number;
  title: string;
  description: string;
  goal: string;
  goal_pkr?: number | null;
  active: boolean;
  product_id?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  image?: string | null;
  created_at?: string;
}
