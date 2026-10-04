# Stockroom Product Management

A React frontend for the deployed LavaLust API. The browser communicates with the API over HTTP only; database access remains entirely on the backend.

## Requirements

- Node.js 18 or newer and npm
- A reachable LavaLust API with its CORS origin configured for this frontend

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and set `VITE_API_URL` to the backend origin, without a trailing slash or `/api` suffix. For example:

   ```env
   VITE_API_URL=http://localhost:8080
   ```

3. Start Vite:

   ```sh
   npm run dev
   ```

4. Open the local URL printed by Vite and sign in with the configured LavaLust administrator account.

## Build and deploy

Run `npm run build`; Vite writes the production site to `dist/`. Deploy the contents of `dist/` to any static host. Configure the host to serve `index.html` for the `/login` and `/products` routes, and set `VITE_API_URL` to the deployed backend origin before building. Vite embeds environment values at build time, so rebuild after changing the API URL.

On the backend, set its allowed frontend origin (for example, `FRONTEND_ORIGIN=https://your-frontend.example`) and ensure the deployed API supports the configured CORS origin. Do not put backend secrets in this frontend; `VITE_*` values are public in the built files.

## API contract used

- `POST /api/login` with `{ "email", "password" }`; stores the returned `access_token` and `refresh_token`.
- `POST /api/logout` with `{ "refresh_token" }` to revoke the refresh token.
- `GET /api/products`, `POST /api/products`, `PUT /api/products/{id}`, and `DELETE /api/products/{id}`.
- Product records use `id`, `product_name`, `description`, `price`, and `quantity`. Successful responses are unwrapped JSON values; API errors contain an `error` message and may include field-level `errors`.
- Product requests attach `Authorization: Bearer <access_token>`. A `401` clears both tokens and sends the user to `/login`.