# RollCall authentication backend

Build 3 provides only the authentication and tenant-security foundation: College, User, and Session persistence; login, current-session, logout, and health endpoints; and shared authorization guards.

Build 4 adds the lecturer-only class, roster, attendance-session, manual submission, history, and correction endpoints. Every lecturer query is scoped by authenticated user id and college id on the server.

## Configure and run

```bash
npm install
copy .env.example .env
npm run seed
npm start
```

Set a unique `SESSION_SECRET` of at least 32 characters. Development seeding is opt-in and requires `DEV_SEED_PASSWORD`; it refuses to run in production. `DATABASE_PATH` defaults to `data/rollcall.sqlite`.

## API

- `POST /api/auth/login` with `{ "identifier": "...", "password": "..." }`
- `GET /api/auth/me` with `Authorization: Bearer <token>`
- `POST /api/auth/logout` with `Authorization: Bearer <token>`
- `GET /api/health`

Sessions use random opaque bearer tokens. Only keyed token digests are stored. Passwords use salted scrypt hashes. Sessions expire server-side and logout revokes them.

The exact roles are `SUPER_ADMIN`, `COLLEGE_ADMIN`, `HOD`, `LECTURER`, and `STUDENT`. Every non-super-admin user belongs to one college. `requireTenant` rejects cross-college access; only `SUPER_ADMIN` has a platform-wide exception. New protected endpoints must call the shared authorization guard before accessing tenant records.

## Verify

```bash
npm test
```
