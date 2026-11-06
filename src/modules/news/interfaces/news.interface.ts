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
}

export interface NewsPostRow {
  id: number;
  title: string;
  content: string;
  thumbnail: string | null;
  created_at: Date;
  category_name: string;
  category_slug: string;
  competition_name: string | null;
  competition_slug: string | null;
}
