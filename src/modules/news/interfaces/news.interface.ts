export interface CategoryRow {
  id: number;
  name: string;
  slug: string;
}

export interface CompetitionRow {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  image_url: string | null;
}

export interface NewsPostRow {
  id: number;
  title: string;
  content: string;
  thumbnail: string | null;
  created_at: Date;
  is_featured: boolean;
  category_id: number;
  competition_id: number | null;
  category_name: string;
  category_slug: string;
  competition_name: string | null;
  competition_slug: string | null;
  competition_image_url: string | null;
}
