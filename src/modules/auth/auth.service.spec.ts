import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { DatabaseService } from '../../database/database.service.js';
import type { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  it('stores a password hash and returns a token without exposing the hash', async () => {
    const createdAt = new Date();
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 7,
          email: 'reader@example.com',
          name: 'Reader',
          role: 'user',
          created_at: createdAt,
        },
      ],
    });
    const jwtService = {
      signAsync: vi.fn().mockResolvedValue('signed-token'),
    };
    const service = new AuthService(
      { query } as unknown as DatabaseService,
      jwtService as unknown as JwtService,
    );

    const result = await service.register({
      email: ' Reader@Example.com ',
      name: ' Reader ',
      password: 'a long test password',
    });

    const insertedParameters = query.mock.calls[0][1] as unknown[];
    expect(insertedParameters[0]).toBe('reader@example.com');
    expect(insertedParameters[1]).toBe('Reader');
    expect(insertedParameters[2]).not.toBe('a long test password');
    expect(result).toMatchObject({
      accessToken: 'signed-token',
      tokenType: 'Bearer',
      user: { id: 7, role: 'user' },
    });
    expect(result.user).not.toHaveProperty('password_hash');
  });

  it('rejects invalid credentials', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          id: 7,
          email: 'reader@example.com',
          name: 'Reader',
          role: 'user',
          password_hash: 'salt:00',
        },
      ],
    });
    const service = new AuthService(
      { query } as unknown as DatabaseService,
      { signAsync: vi.fn() } as unknown as JwtService,
    );

    await expect(
      service.login('reader@example.com', 'wrong password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
