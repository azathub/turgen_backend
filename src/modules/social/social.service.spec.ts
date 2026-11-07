import { SocialService } from './social.service.js';
import type { DatabaseService } from '../../database/database.service.js';

describe('SocialService', () => {
  it('likes a post idempotently for the authenticated user', async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ id: 8 }] })
      .mockResolvedValueOnce({ rows: [] });
    const service = new SocialService({ query } as unknown as DatabaseService);

    await expect(service.like(4, 8)).resolves.toEqual({
      postId: 8,
      liked: true,
    });

    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('ON CONFLICT (user_id, post_id) DO NOTHING'),
      [4, 8],
    );
  });
});
