import { NewsService } from './news.service.js';
import type { DatabaseService } from '../../database/database.service.js';

describe('NewsService', () => {
  it('returns competition image URLs for a category', async () => {
    const competition = {
      id: 2,
      name: 'Premier League',
      slug: 'premier-league',
      category_id: 1,
      image_url: 'https://images.example.test/premier-league.png',
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ id: 1 }] })
      .mockResolvedValueOnce({ rows: [competition] });
    const service = new NewsService({ query } as unknown as DatabaseService);

    await expect(service.getCompetitionsBySport('football')).resolves.toEqual([
      competition,
    ]);

    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('image_url'),
      [1],
    );
  });

  it('uses parameterized filters and returns the last item as the next cursor', async () => {
    const rows = Array.from({ length: 11 }, (_, index) => ({
      id: 20 - index,
      title: `Post ${index}`,
    }));
    const query = vi.fn().mockResolvedValue({ rows });
    const service = new NewsService({ query } as unknown as DatabaseService);

    const result = await service.getInfiniteNewsFeed({
      categorySlug: 'football',
      cursor: 15,
      limit: 10,
    });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('cat.slug = $1'),
      ['football', 15, 11],
    );
    expect(result.data).toHaveLength(10);
    expect(result.nextCursor).toBe(11);
  });

  it('does not set a next cursor when the result fits on one page', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 3 }] });
    const service = new NewsService({ query } as unknown as DatabaseService);

    const result = await service.getInfiniteNewsFeed({ limit: 10 });

    expect(result).toEqual({ data: [{ id: 3 }], nextCursor: null });
  });

  it('returns a public URL and share content for external platforms', async () => {
    const previousPublicUrl = process.env.PUBLIC_API_URL;
    process.env.PUBLIC_API_URL = 'https://news.example.test';
    const post = {
      id: 3,
      title: 'Example title',
      content: 'Example content',
      thumbnail: null,
      is_featured: false,
      created_at: new Date(),
      category_id: 1,
      competition_id: null,
      category_name: 'Football',
      category_slug: 'football',
      competition_name: null,
      competition_slug: null,
    };
    const query = vi.fn().mockResolvedValue({ rows: [post] });
    const service = new NewsService({ query } as unknown as DatabaseService);

    await expect(service.getShareLink(3)).resolves.toEqual({
      postId: 3,
      url: 'https://news.example.test/news/3',
      title: 'Example title',
      text: 'Example content',
    });

    if (previousPublicUrl === undefined) {
      delete process.env.PUBLIC_API_URL;
    } else {
      process.env.PUBLIC_API_URL = previousPublicUrl;
    }
  });
});
