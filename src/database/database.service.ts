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
    // Initialize the PostgreSQL connection pool using the environment variable configuration
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    try {
      // Check out a temporary client from the pool to test if the connection details are valid
      const client = await this.pool.connect();
      console.log('📦 Successfully connected to PostgreSQL database!');

      // Crucial: Release the test client back into the pool to make it available for future queries
      client.release();
    } catch (error) {
      // Provide clean error handling details if the connection handshake fails
      if (error instanceof Error) {
        console.error(`Database connection failed: ${error.message}`);
      } else {
        console.error('An unexpected error occurred:', String(error));
      }
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
      console.log('🔌 PostgreSQL pool has been closed cleanly.');
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
    // Delegates the query execution safely to the under-the-hood connection pool
    return this.pool.query<T>(text, params);
  }
}
