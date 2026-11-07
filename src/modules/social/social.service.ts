import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import type { UserRole } from '../auth/auth.types.js';

interface UserIdRow {
  id: number;
}

@Injectable()
export class SocialService {
  constructor(private readonly db: DatabaseService) {}

  async getComments(postId: number) {
    await this.assertPostExists(postId);
    const result = await this.db.query(
      `SELECT c.id, c.post_id, c.content, c.created_at, c.updated_at,
              u.id AS author_id, u.name AS author_name
       FROM post_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at, c.id`,
      [postId],
    );
    return result.rows;
  }

  async createComment(userId: number, postId: number, content: string) {
    await this.assertPostExists(postId);
    const result = await this.db.query(
      `INSERT INTO post_comments (user_id, post_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, post_id, content, created_at, updated_at`,
      [userId, postId, content.trim()],
    );
    return result.rows[0];
  }

  async deleteComment(
    commentId: number,
    userId: number,
    role: UserRole,
  ): Promise<void> {
    const result = await this.db.query(
      `DELETE FROM post_comments
       WHERE id = $1 AND (user_id = $2 OR $3 = 'admin')`,
      [commentId, userId, role],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Comment not found or cannot be deleted');
    }
  }

  async bookmark(userId: number, postId: number) {
    await this.assertPostExists(postId);
    await this.db.query(
      `INSERT INTO post_bookmarks (user_id, post_id)
       VALUES ($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING`,
      [userId, postId],
    );
    return { postId, bookmarked: true };
  }

  async removeBookmark(userId: number, postId: number) {
    await this.db.query(
      'DELETE FROM post_bookmarks WHERE user_id = $1 AND post_id = $2',
      [userId, postId],
    );
    return { postId, bookmarked: false };
  }

  async getBookmarks(userId: number) {
    const result = await this.db.query(
      `SELECT p.id, p.title, p.thumbnail, p.created_at,
              cat.name AS category_name, cat.slug AS category_slug,
              comp.name AS competition_name, comp.slug AS competition_slug,
              b.created_at AS bookmarked_at
       FROM post_bookmarks b
       JOIN posts p ON p.id = b.post_id
       JOIN categories cat ON cat.id = p.category_id
       LEFT JOIN competitions comp ON comp.id = p.competition_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC, p.id DESC`,
      [userId],
    );
    return result.rows;
  }

  async like(userId: number, postId: number) {
    await this.assertPostExists(postId);
    await this.db.query(
      `INSERT INTO post_likes (user_id, post_id)
       VALUES ($1, $2) ON CONFLICT (user_id, post_id) DO NOTHING`,
      [userId, postId],
    );
    return { postId, liked: true };
  }

  async unlike(userId: number, postId: number) {
    await this.db.query(
      'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2',
      [userId, postId],
    );
    return { postId, liked: false };
  }

  async getLikes(postId: number) {
    await this.assertPostExists(postId);
    const result = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM post_likes WHERE post_id = $1',
      [postId],
    );
    return { postId, count: Number(result.rows[0].count) };
  }

  private async assertPostExists(postId: number): Promise<void> {
    const result = await this.db.query<UserIdRow>(
      'SELECT id FROM posts WHERE id = $1',
      [postId],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`News post ${postId} not found`);
    }
  }
}
