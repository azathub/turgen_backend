import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { DatabaseService } from './../src/database/database.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const previousEnvironment = {
    jwtSecret: process.env.JWT_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    publicApiUrl: process.env.PUBLIC_API_URL,
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-with-at-least-32-characters';
    process.env.ADMIN_EMAIL = '';
    process.env.ADMIN_PASSWORD = '';
    process.env.PUBLIC_API_URL = 'https://news.example.test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DatabaseService)
      .useValue({
        query: vi.fn().mockImplementation((text: string) => ({
          rows: text.includes('WHERE p.id = $1')
            ? [
                {
                  id: 1,
                  title: 'Example post',
                  content: 'Example story',
                  thumbnail: null,
                  is_featured: false,
                  created_at: new Date(),
                  category_id: 1,
                  competition_id: null,
                  category_name: 'Football',
                  category_slug: 'football',
                  competition_name: null,
                  competition_slug: null,
                },
              ]
            : [],
        })),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('serves the news feed without authentication', () => {
    return request(app.getHttpServer())
      .get('/news')
      .expect(200)
      .expect({ data: [], nextCursor: null });
  });

  it('serves a share URL without authentication', () => {
    return request(app.getHttpServer())
      .get('/news/1/share-link')
      .expect(200)
      .expect({
        postId: 1,
        url: 'https://news.example.test/news/1',
        title: 'Example post',
        text: 'Example story',
      });
  });

  it('requires authentication for social features', () => {
    return request(app.getHttpServer()).get('/me/bookmarks').expect(401);
  });

  it('does not expose in-app friend endpoints', () => {
    return request(app.getHttpServer()).get('/social/friends').expect(404);
  });

  it('documents public sharing and protected social routes', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );

    expect(document.paths['/news']?.get).toBeDefined();
    expect(
      document.paths['/news/{id}/share-link']?.get?.security,
    ).toBeUndefined();
    expect(document.paths['/auth/login']?.post).toBeDefined();
    expect(document.paths['/me/bookmarks']?.get?.security).toEqual([
      { bearer: [] },
    ]);
  });

  it('validates public news query parameters', () => {
    return request(app.getHttpServer()).get('/news?limit=101').expect(400);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (previousEnvironment.jwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousEnvironment.jwtSecret;
    }
    if (previousEnvironment.adminEmail === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = previousEnvironment.adminEmail;
    }
    if (previousEnvironment.adminPassword === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = previousEnvironment.adminPassword;
    }
    if (previousEnvironment.publicApiUrl === undefined) {
      delete process.env.PUBLIC_API_URL;
    } else {
      process.env.PUBLIC_API_URL = previousEnvironment.publicApiUrl;
    }
  });
});
