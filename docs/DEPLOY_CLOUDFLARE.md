# Deploying the website on Cloudflare Pages

The staff API already runs on Cloudflare (see `STAFF_MEDIA_SETUP.md`), so the site goes in the same account and the same dashboard.

## First deploy (use your own account for now)

1. Push the project to GitHub.
2. Cloudflare dashboard > **Workers & Pages > Create > Pages > Connect to Git**. Pick the `CAW` repo.
3. Build settings:
   - Framework preset: **Vite** (or None)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable `NODE_VERSION` = `22` (the repo also has a `.node-version` file)
4. Add these **environment variables** (Production), then deploy:
   - `VITE_STAFF_API_URL` = the address of your staff Worker, for example `https://caw-staff-api.<your-subdomain>.workers.dev`
   - `VITE_MEDIA_BASE_URL` = your media address from `STAFF_MEDIA_SETUP.md` step 1
5. When the first build finishes you get `https://<project>.pages.dev`.
6. **Allow the site to call the staff API.** In `worker/wrangler.toml`, set
   `ALLOWED_ORIGINS = "https://<project>.pages.dev"` (add your own domain later, comma separated), then run `npx wrangler deploy` in the `worker` folder.
7. Open the site, open the staff login, and sign in to test.

Every push to `main` redeploys the site automatically. Pull requests get their own preview address.

## Moving it to the client's own account later

Create a Cloudflare account with the client's email, repeat steps 2 to 6 there, and (if the site has a domain) move the domain across in the same dashboard. Redeploy the Worker in the client's account and update `VITE_STAFF_API_URL`. Cloudflare projects cannot be transferred between accounts, but a redeploy from the same GitHub repo takes about ten minutes.

## Custom domain

Pages project > **Custom domains > Set up a domain**. If the domain's DNS is on Cloudflare this is two clicks. Add the new address to `ALLOWED_ORIGINS` and redeploy the Worker.
