import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CompetitionRow, NewsPostRow } from './interfaces/news.interface.js';
import { GetNewsQueryDto } from './dto/get-news-query.dto.js';

@Injectable()
export class NewsService {
  constructor(private readonly db: DatabaseService) {}

  async getCompetitionsBySport(
    categorySlug: string,
  ): Promise<CompetitionRow[]> {
    const categoryRes = await this.db.query(
      'SELECT id FROM categories WHERE slug = $1',
      [categorySlug],
    );

    if (categoryRes.rows.length === 0) {
      throw new NotFoundException(`Category ${categorySlug} not found`);
    }

    const categoryId = categoryRes.rows[0].id;

    const competitionRes = await this.db.query<CompetitionRow>(
      'SELECT id, name, slug, category_id FROM competitions WHERE category_id = $1',
      categoryId,
    );

    return competitionRes.rows;
  }

  async getInfiniteNewsFeed(query: GetNewsQueryDto) {
    const { categorySlug, competitionSlug, cursor, limit = 10 } = query;

    let baseQuery = `
    SELECT p.id, p.title, p.content, p.thumbnail, p.created_at,
           cat.name AS category_name, cat.slug AS category_slug,
           comp.name as competition_name, comp.slug AS competition_slug
    FROM posts p
    JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN competitions comp ON p.competition_id = comp.id
    WHERE 1=1
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (competitionSlug) {
      baseQuery += `AND comp.slug = $${paramIndex++}`;
      queryParams.push(competitionSlug);
    } else if (categorySlug && categorySlug !== 'all') {
      baseQuery += ` AND cat.slug == $${paramIndex++}`;
      queryParams.push(categorySlug);
    }

    if (cursor) {
      baseQuery += ` AND p.id < $${paramIndex++}`;
      queryParams.push(cursor);
    }

    baseQuery += ` ORDER BY p.id DESC LIMIT $${paramIndex++}`;
    queryParams.push(limit + 1);

    const postsRes = await this.db.query<NewsPostRow>(baseQuery, queryParams);
    const posts = postsRes.rows;

    let nextCursor: number | null = null;
    if (posts.length > limit) {
      posts.pop();
      nextCursor = posts[posts.length - 1].id;
    }

    return {
      data: posts,
      nextCursor,
    };
  }
}
