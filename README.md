# Turgen Backend

NestJS API for public sports news, optional reader accounts, admin publishing,
and authenticated social features.

## Requirements and setup

- Node.js compatible with this repository's package configuration
- PostgreSQL
- A JWT signing secret of at least 32 characters

Install dependencies and configure environment variables:

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` and `JWT_SECRET` in `.env`, then apply the schema:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/001_social_and_auth.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/002_competition_image.sql
npm run db:seed
```

The migration creates the news schema (if it does not exist) and the account,
bookmark, like, and comment tables. The second migration adds competition
image URLs. Back up production data and test migrations in staging before
applying them.

The seed command inserts sports categories (football, basketball, tennis,
cricket, rugby, volleyball, baseball, and ice hockey), related competitions,
and 35 competitions (at least four in each category). It also inserts 1,000
clearly labeled demo posts with sport-specific topics, varied article formats,
and different reading prompts. It refreshes older generated demo posts in
place, so rerunning it does not duplicate them. Existing categories and
competitions are updated by slug. Competition images use replaceable
`placehold.co` URLs; change them to your own hosted image URLs when ready. The
script runs in a transaction and rolls back its changes if it fails.

To create the initial administrator, set both `ADMIN_EMAIL` and
`ADMIN_PASSWORD` before starting the API. The password must be at least 10
characters. Startup creates the admin only when the email is unused; it does
not reset or promote an existing account. Do not commit credentials.

```bash
npm run start:dev
```

Interactive Swagger UI is at `http://localhost:3000/docs`; the OpenAPI JSON is
at `http://localhost:3000/docs`. To let developers on the same Wi-Fi access
the API, start the app on all network interfaces (the default `HOST` is
`0.0.0.0`) and give them your computer's private IPv4 address, for example
`http://192.168.1.10:3000`. They can open
`http://192.168.1.10:3000/docs` for Swagger. Find the address with `ip addr`
on Linux, `ipconfig` on Windows, or `ifconfig` on macOS. Set `PORT` to change
the listening port and `HOST` to override the bind address. Set
`PUBLIC_API_URL` to your computer's LAN URL if external share links should use
that address.

Browser-based web clients must have their exact origins listed in
`CORS_ORIGINS` as a comma-separated list (scheme and port included when
applicable), for example `http://localhost:5173` for a Vite development
frontend. Set these on the API computer before starting it. Wildcard origins
are not accepted. Native mobile clients do not use browser CORS and can call
the API at your computer's LAN URL directly.

Make sure your computer's firewall allows inbound connections to the API port
from your local network. Do not configure router port forwarding: this setup
is for the same Wi-Fi/LAN only. Public news routes are unauthenticated by
design; admin and account actions require JWT authentication.

## Public news API

Reading news does not require an account or token.

| Method | Path                                  | Description                                                                                      |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `GET`  | `/`                                   | Basic hello/availability response                                                                |
| `GET`  | `/news`                               | Cursor-paginated feed; optional `categorySlug`, `competitionSlug`, `cursor`, and `limit` (1–100) |
| `GET`  | `/news/:id`                           | Read a post                                                                                      |
| `GET`  | `/news/:id/share-link`                | Get a public post URL, title, and text to share through external platforms                       |
| `GET`  | `/news/categories/:slug/competitions` | List competitions for a category                                                                 |

Competition records include `image_url`; news feed and post details also
include `competition_image_url` when a post belongs to a competition.

The feed returns `{ "data": [...], "nextCursor": 123 }`; `nextCursor` is `null`
when there are no more posts. Pass the cursor as `cursor` to fetch the next
page. A category slug of `all` leaves the feed unfiltered. A competition filter
takes precedence over a category filter.

## Accounts and authentication

Registration and login are optional for public reading. To use bookmarks,
likes, and comments, register or sign in and send the returned access token
with protected requests:

```http
Authorization: Bearer <accessToken>
```

| Method | Path             | Description                                                             |
| ------ | ---------------- | ----------------------------------------------------------------------- |
| `POST` | `/auth/register` | Register with `email`, `name`, and a password of at least 10 characters |
| `POST` | `/auth/login`    | Sign in with `email` and `password`                                     |
| `GET`  | `/auth/me`       | Get the authenticated profile                                           |

Passwords are stored as salted scrypt hashes. Access tokens expire after one
hour. Set a strong, private `JWT_SECRET` in every environment.

## Admin publishing

All post management routes require a JWT for a user with the `admin` role.
Create/update bodies support `title`, `content`, `categoryId`, optional
`competitionId`, `thumbnail`, and `isFeatured`.

| Method   | Path        | Description   |
| -------- | ----------- | ------------- |
| `POST`   | `/news`     | Create a post |
| `PUT`    | `/news/:id` | Update a post |
| `DELETE` | `/news/:id` | Delete a post |

Competition IDs must belong to the selected category. Public post reads remain
available regardless of authentication.

## Social features

Every route below requires a valid JWT. Posts can be shared externally by
passing the public URL from `GET /news/:id/share-link` to a platform share
sheet, link field, or clipboard. The API does not maintain in-app friends,
friend requests, or a share inbox.

| Method           | Path                            | Description                                        |
| ---------------- | ------------------------------- | -------------------------------------------------- |
| `PUT` / `DELETE` | `/social/news/:postId/bookmark` | Add or remove a bookmark                           |
| `GET`            | `/me/bookmarks`                 | List the authenticated user's bookmarks            |
| `PUT` / `DELETE` | `/social/news/:postId/like`     | Like or unlike a post                              |
| `GET`            | `/social/news/:postId/likes`    | Get a post's like count                            |
| `GET` / `POST`   | `/social/news/:postId/comments` | List or add comments                               |
| `DELETE`         | `/social/comments/:id`          | Delete your comment; admins may delete any comment |

Bookmarks and likes are idempotent per user and post.

## Validation

```bash
npm test
npm run lint
npm run build
```
