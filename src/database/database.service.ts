import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import pkg, { QueryResultRow } from 'pg';

const { Pool } = pkg;

/**
 * Service responsible for managing the connection pool to the PostgreSQL database.
 * Implements NestJS lifecycle hooks to manage connections on app startup and shutdown.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  /**
   * Internal reference to the node-postgres connection pool instance.
   * The '!' operator tells TypeScript that initialization happens inside onModuleInit.
   */
  private pool!: pkg.Pool;

  /**
   * NestJS Lifecycle Hook: Runs automatically when the host module initializes.
   * Establishes the database connection pool and verifies the connection.
   */
  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL must be configured');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      const client = await this.pool.connect();
      client.release();
      console.log('Successfully connected to PostgreSQL database');
    } catch (error) {
      await this.pool.end();
      throw new Error('Database connection failed', { cause: error });
    }
  }

  /**
   * NestJS Lifecycle Hook: Runs automatically when the application is shutting down.
   * Ensures that all active or idle database connections are closed cleanly.
   */
  async onModuleDestroy() {
    // Only attempt to tear down the pool if it was successfully initialized first
    if (this.pool) {
      await this.pool.end();
      console.log('PostgreSQL connection pool closed');
    }
  }

  /**
   * Executes a database query using a safe, parameterized SQL query format.
   * Supports generic type parameters to ensure type-safe results.
   *
   * @template T The expected interface or shape of a single row returned from the database. Must extend QueryResultRow.
   * @param text The SQL query string (e.g., 'SELECT * FROM users WHERE id = $1')
   * @param params Optional array of parameters to safely inject into placeholders ($1, $2, etc.)
   * @returns A Promise resolving to the query results containing rows matching type T
   */
  async query<T extends QueryResultRow>(
    text: string,
    params?: any[],
  ): Promise<pkg.QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }
}
