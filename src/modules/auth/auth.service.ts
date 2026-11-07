import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isEmail } from 'class-validator';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseService } from '../../database/database.service.js';
import type { AuthenticatedUser, UserProfile, UserRole } from './auth.types.js';

const scrypt = promisify(scryptCallback);

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  password_hash?: string;
  created_at: Date;
}

interface RegistrationInput {
  email: string;
  name: string;
  password: string;
}

interface PgError extends Error {
  code?: string;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email && !password) {
      return;
    }
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must both be configured');
    }
    if (!isEmail(email)) {
      throw new Error('ADMIN_EMAIL must be a valid email address');
    }
    if (password.length < 10) {
      throw new Error('ADMIN_PASSWORD must be at least 10 characters long');
    }

    const existing = await this.db.query<UserRow>(
      'SELECT id, email, name, role FROM users WHERE lower(email) = $1',
      [email],
    );
    if (existing.rows.length > 0) {
      if (existing.rows[0].role !== 'admin') {
        throw new Error('ADMIN_EMAIL belongs to a non-admin user');
      }
      return;
    }

    const passwordHash = await this.hashPassword(password);
    const inserted = await this.db.query<UserRow>(
      `INSERT INTO users (email, name, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT DO NOTHING
       RETURNING id, email, name, role`,
      [email, 'Administrator', passwordHash],
    );

    if (inserted.rows.length === 0) {
      const raced = await this.db.query<UserRow>(
        'SELECT id, email, name, role FROM users WHERE lower(email) = $1',
        [email],
      );
      if (raced.rows[0]?.role !== 'admin') {
        throw new Error('ADMIN_EMAIL belongs to a non-admin user');
      }
    }
  }

  async register(input: RegistrationInput) {
    const email = input.email.trim().toLowerCase();
    const passwordHash = await this.hashPassword(input.password);
    let user: UserRow;

    try {
      const result = await this.db.query<UserRow>(
        `INSERT INTO users (email, name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, role, created_at`,
        [email, input.name.trim(), passwordHash],
      );
      user = result.rows[0];
    } catch (error) {
      if ((error as PgError).code === '23505') {
        throw new ConflictException(
          'An account with this email already exists',
        );
      }
      throw error;
    }

    return this.createSession(user);
  }

  async login(emailInput: string, password: string) {
    const result = await this.db.query<UserRow>(
      `SELECT id, email, name, role, password_hash, created_at
       FROM users WHERE lower(email) = $1`,
      [emailInput.trim().toLowerCase()],
    );
    const user = result.rows[0];
    if (
      !user?.password_hash ||
      !(await this.verifyPassword(password, user.password_hash))
    ) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    return this.createSession(user);
  }

  async getProfile(userId: number): Promise<UserProfile | undefined> {
    const result = await this.db.query<UserProfile>(
      `SELECT id, email, name, role, created_at FROM users WHERE id = $1`,
      [userId],
    );
    return result.rows[0];
  }

  private async createSession(user: UserRow) {
    const payload: AuthenticatedUser = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
      },
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, keyHex] = storedHash.split(':');
    if (!salt || !keyHex || !/^[\da-f]+$/i.test(keyHex)) {
      return false;
    }
    const expected = Buffer.from(keyHex, 'hex');
    const actual = (await scrypt(password, salt, expected.length)) as Buffer;
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
