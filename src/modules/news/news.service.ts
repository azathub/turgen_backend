import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { CompetitionRow, NewsPostRow } from './interfaces/news.interface.js';
import { GetNewsQueryDto } from './dto/get-news-query.dto.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';

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
      'SELECT id, name, slug, category_id, image_url FROM competitions WHERE category_id = $1 ORDER BY name',
      [categoryId],
    );

    return competitionRes.rows;
  }

  async getNewsPost(id: number): Promise<NewsPostRow> {
    const result = await this.db.query<NewsPostRow>(
      `SELECT p.id, p.title, p.content, p.thumbnail, p.is_featured, p.created_at,
              p.category_id, p.competition_id,
              cat.name AS category_name, cat.slug AS category_slug,
              comp.name AS competition_name, comp.slug AS competition_slug,
              comp.image_url AS competition_image_url
       FROM posts p
       JOIN categories cat ON p.category_id = cat.id
       LEFT JOIN competitions comp ON p.competition_id = comp.id
       WHERE p.id = $1`,
      [id],
    );
    if (!result.rows[0]) {
      throw new NotFoundException(`News post ${id} not found`);
    }
    return result.rows[0];
  }

  async getShareLink(id: number) {
    const post = await this.getNewsPost(id);
    const baseUrl =
      process.env.PUBLIC_API_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`;
    let url: URL;
    try {
      url = new URL(`/news/${post.id}`, baseUrl);
    } catch {
      throw new ServiceUnavailableException(
        'PUBLIC_API_URL is not a valid URL',
      );
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new ServiceUnavailableException(
        'PUBLIC_API_URL must use HTTP or HTTPS',
      );
    }
    return {
      postId: post.id,
      url: url.toString(),
      title: post.title,
      text: post.content,
    };
  }

  async getInfiniteNewsFeed(query: GetNewsQueryDto) {
    const { categorySlug, competitionSlug, cursor, limit = 10 } = query;

    let baseQuery = `
    SELECT p.id, p.title, p.content, p.thumbnail, p.created_at,
           p.is_featured, p.category_id, p.competition_id,
           cat.name AS category_name, cat.slug AS category_slug,
           comp.name as competition_name, comp.slug AS competition_slug,
           comp.image_url AS competition_image_url
    FROM posts p
    JOIN categories cat ON p.category_id = cat.id
    LEFT JOIN competitions comp ON p.competition_id = comp.id
    WHERE 1=1
    `;

    const queryParams: Array<string | number> = [];
    let paramIndex = 1;

    if (competitionSlug) {
      baseQuery += ` AND comp.slug = $${paramIndex++}`;
      queryParams.push(competitionSlug);
    } else if (categorySlug && categorySlug !== 'all') {
      baseQuery += ` AND cat.slug = $${paramIndex++}`;
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

  async createPost(input: CreatePostDto): Promise<NewsPostRow> {
    await this.assertCategoryAndCompetition(
      input.categoryId,
      input.competitionId ?? null,
    );
    const result = await this.db.query<NewsPostRow>(
      `INSERT INTO posts (title, content, thumbnail, is_featured, category_id, competition_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, content, thumbnail, is_featured, created_at`,
      [
        input.title.trim(),
        input.content,
        input.thumbnail ?? null,
        input.isFeatured ?? false,
        input.categoryId,
        input.competitionId ?? null,
      ],
    );
    return this.getNewsPost(result.rows[0].id);
  }

  async updatePost(id: number, input: UpdatePostDto): Promise<NewsPostRow> {
    const current = await this.getNewsPost(id);
    const categoryId = input.categoryId ?? current.category_id;
    const competitionId =
      input.competitionId === undefined
        ? current.competition_id
        : input.competitionId;
    await this.assertCategoryAndCompetition(categoryId, competitionId);

    await this.db.query(
      `UPDATE posts SET
         title = $1,
         content = $2,
         thumbnail = $3,
         is_featured = $4,
         category_id = $5,
         competition_id = $6
       WHERE id = $7`,
      [
        input.title?.trim() ?? current.title,
        input.content ?? current.content,
        input.thumbnail === undefined ? current.thumbnail : input.thumbnail,
        input.isFeatured ?? current.is_featured,
        categoryId,
        competitionId,
        id,
      ],
    );
    return this.getNewsPost(id);
  }

  async deletePost(id: number): Promise<void> {
    const result = await this.db.query('DELETE FROM posts WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      throw new NotFoundException(`News post ${id} not found`);
    }
  }

  private async assertCategoryAndCompetition(
    categoryId: number,
    competitionId: number | null,
  ): Promise<void> {
    const category = await this.db.query(
      'SELECT id FROM categories WHERE id = $1',
      [categoryId],
    );
    if (category.rows.length === 0) {
      throw new UnprocessableEntityException(
        'The selected category does not exist',
      );
    }
    if (competitionId !== null) {
      const competition = await this.db.query(
        'SELECT id FROM competitions WHERE id = $1 AND category_id = $2',
        [competitionId, categoryId],
      );
      if (competition.rows.length === 0) {
        throw new UnprocessableEntityException(
          'The competition must belong to the selected category',
        );
      }
    }
  }
}
