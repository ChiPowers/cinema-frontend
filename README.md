# Cinema Game — Frontend

Next.js frontend for [Cinema Game](https://github.com/ChiPowers/cinema_game), a movie trivia game where you connect actors through shared movies.

## Stack

- Next.js
- Tailwind CSS
- Framer Motion
- Cloudflare Pages (hosting)

## Getting started

```bash
npm install
cp .env.example .env.local
# edit .env.local — see Configuration below
npm run dev
```

UI runs at `http://localhost:3000` (or the next available port).

You will also need the [backend](https://github.com/ChiPowers/cinema_game) running locally on `http://localhost:8000`. The frontend requires the backend's `feature/auth` branch (or successor); the two pieces of work are co-versioned and depend on each other.

## Configuration

All environment variables live in `.env.local`, which is gitignored. Start from the tracked `.env.example` and fill in real values.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Browser-visible URL of the backend (`/game/*` endpoints). |
| `BACKEND_URL` | Server-side URL of the backend; used by the NextAuth `signIn` callback to call `/auth/check-beta`. Often the same as `NEXT_PUBLIC_API_URL` in local development. |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console. |
| `NEXTAUTH_SECRET` | HS256 key used by NextAuth to sign session JWTs that the backend verifies. **Must match the backend's `NEXTAUTH_SECRET` byte-for-byte.** Generate with `openssl rand -base64 32`. |
| `INTERNAL_SECRET` | Shared secret sent as `x-internal-secret` on server-to-server calls to `/auth/check-beta`. **Must match the backend's `INTERNAL_SECRET` byte-for-byte.** Generate with `openssl rand -base64 32`. |

### Google OAuth client setup

In [Google Cloud Console](https://console.cloud.google.com):

1. Create a project (or select an existing one) and open **APIs & Services → OAuth consent screen**. Choose **External** user type. Fill in the app name, your email, and the developer contact email. Leave scopes as default (`email`, `profile`).
2. While the consent screen is in "testing" mode, add each developer's Gmail address as a test user. Only listed test users can authenticate.
3. Open **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**. Application type: **Web application**.
4. Add authorized redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://<prod-domain>/api/auth/callback/google`
5. Copy the **Client ID** and **Client Secret** into `.env.local`.

## Authentication

Access requires a Google sign-in plus presence on the backend's beta-user allowlist.

### Sign-in flow

1. The middleware (`middleware.ts`) protects every route except `/login` and `/api/auth/*`. An unauthenticated visit redirects to `/login`.
2. The user clicks "Sign in with Google" on `/login`. NextAuth runs the Google OAuth dance.
3. NextAuth's `signIn` callback (in `lib/auth.ts`, wired up by `app/api/auth/[...nextauth]/route.ts`) calls `POST ${BACKEND_URL}/auth/check-beta` with `x-internal-secret: <INTERNAL_SECRET>` and the user's email. If the backend returns non-2xx, sign-in is refused and the login page shows "Your account is not on the beta list yet." (controlled by the `error=AccessDenied` query param).
4. On success, the `session` callback mints an HS256 JWT signed with `NEXTAUTH_SECRET` and stores it on the session as `backendToken`.
5. All subsequent `/game/*` fetches attach `Authorization: Bearer <backendToken>`. The backend's `require_auth` dependency verifies the JWT with the same `NEXTAUTH_SECRET`.

### Beta-user allowlist

Two independent gates control beta access, and both must pass:

- **Google level** — only Gmail addresses listed as test users in the Google Cloud Console can authenticate while the OAuth consent screen is in "testing" mode.
- **App level** — the backend's `beta_users` SQLite table. Manage entries from the backend repo:

  ```bash
  poetry run python scripts/manage_beta_users.py add user@example.com
  poetry run python scripts/manage_beta_users.py list
  ```

Adding someone in only one place is not enough.

## Docker

Build the image, supplying the browser-visible API URL as a build arg. `NEXT_PUBLIC_*` variables are inlined into the client bundle at build time, so this cannot be supplied later at `docker run`:

```bash
docker build -t cinema-game-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 .
```

Run it, supplying the remaining variables from `.env.local` at runtime:

```bash
docker run -p 3000:3000 --env-file .env.local -e BACKEND_URL=http://localhost:8000 cinema-game-frontend
```

The UI is then available at `http://localhost:3000`. If running both containers together, put them on the same Docker network and point `BACKEND_URL` at the backend container's name rather than `localhost`.

A `docker-compose.yml` to run this frontend together with the [backend](https://github.com/ChiPowers/cinema_game), with env file wiring for both, is planned as a follow-up once both repos' Dockerfiles have landed.

## Related

- [Backend repo](https://github.com/ChiPowers/cinema_game)
