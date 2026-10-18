# Staff login and build photos/videos: setup

How it fits together:

```
Staff phone/laptop  ->  Staff API (Cloudflare Worker, free)  ->  GitHub repo "CAW-media"  ->  GitHub Pages
                         checks the login, saves the file          stores the files        serves them to visitors
Visitors  ->  website  ->  reads media/manifest.json from GitHub Pages
```

Cost: 0. Nothing here needs a credit card. (GitHub, Cloudflare and the website host all have free plans that cover this.)

## 1. Create the media repo and turn on GitHub Pages

1. On GitHub, create a **public** repo named `CAW-media` (tick "Add a README").
2. Repo **Settings > Pages**: Source = "Deploy from a branch", Branch = `main`, folder `/ (root)`. Save.
3. Your files will be served at `https://<your-username>.github.io/CAW-media/`. Write this address down. It is your `VITE_MEDIA_BASE_URL`.

Everything in this repo is public. Only upload pictures and videos you are happy for customers to see.

## 2. Make a token the Worker can use

GitHub > profile picture > **Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token**.

- Repository access: **Only select repositories**, choose `CAW-media` only.
- Permissions > Repository permissions > **Contents: Read and write**. Nothing else.
- Expiration: 1 year. Put a reminder in your calendar; when it expires uploads stop until you make a new one (step 3, `GITHUB_TOKEN`).

Copy the token once. You will paste it in step 3.

## 3. Deploy the staff API (Cloudflare Worker)

1. Make a free account at cloudflare.com.
2. In a terminal, in the `worker` folder of this project:

   ```
   cd worker
   npx wrangler login
   ```
3. Open `wrangler.toml` and check `GITHUB_REPO` is `<your-username>/CAW-media`.
4. Make the logins. One command per person (the two staff accounts):

   ```
   node hash-password.mjs owner "demo-only-password"
   node hash-password.mjs mechanic "their-own-password"
   ```
   Each prints something like `{"owner":"3f9c..."}`. Join the two into one line, for example:

   ```
   {"owner":"3f9c...","mechanic":"a41d..."}
   ```
   Usernames can be any lowercase names. `demo-only-password` is only a placeholder. Use your own long password.
5. Save the three secrets. Wrangler asks you to type or paste each value (nothing is shown on screen):

   ```
   npx wrangler secret put STAFF_USERS      # paste the joined line from step 4
   npx wrangler secret put SESSION_SECRET   # paste any long random text, see below
   npx wrangler secret put GITHUB_TOKEN     # paste the token from step 2
   ```
   To make a random `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
6. Deploy:

   ```
   npx wrangler deploy
   ```
   It prints your API address, like `https://caw-staff-api.<you>.workers.dev`. That is your `VITE_STAFF_API_URL`.

## 4. Point the website at it

Create a file named `.env.local` in the project root (it is not committed):

```
VITE_STAFF_API_URL=https://caw-staff-api.<you>.workers.dev
VITE_MEDIA_BASE_URL=https://<your-username>.github.io/CAW-media
```

On your hosting service, add the same two names as environment variables in the project settings, then redeploy. They are read when the site is built.

Finally, tell the API which website address may call it. In `worker/wrangler.toml` set:

```
ALLOWED_ORIGINS = "https://your-site-address,http://localhost:3000"
```
then run `npx wrangler deploy` again.

## 5. Try it locally first (no accounts needed)

```
npm run worker:test    # 29 automatic checks of the API
npm run worker:demo    # fake API + fake GitHub on http://127.0.0.1:8787, login owner / demo-only-password
```
With the demo running, put this in `.env.local` and run `npm run dev`:

```
VITE_STAFF_API_URL=http://127.0.0.1:8787
VITE_MEDIA_BASE_URL=http://127.0.0.1:8787/pages
```
Demo data lives in memory and disappears when you stop it.

## 6. Daily use (staff)

1. Open the site, click the small lock icon, sign in.
2. Tab **Finished Builds: Photos & Videos** > **New finished build** > fill in the title, vehicle, year and a sentence about the work > **Create build**.
3. **Add photos or videos.** Photos are shrunk on the phone before upload. Videos: MP4 or WebM, up to 10 MB (about 15 to 20 seconds).
4. New files show on the public site 1 to 2 minutes later (GitHub Pages has to publish them).
5. The trash icon removes a file. **Delete build** removes the build and its files.

## 7. Changing a password

Run step 3.4 again for that person with the new password, join the lines, and run `npx wrangler secret put STAFF_USERS`. Old sessions end on their own after 12 hours.

## Limits to know about

- GitHub Pages: 1 GB total per site, about 100 GB of visitor traffic a month (soft limits). Photos at about 200 KB each give you thousands of photos. Videos use space fast: 100 videos of 10 MB is 1 GB. Keep videos short, or put long ones on YouTube (unlisted) and link them.
- Cloudflare free Worker: 100,000 requests a day, and a small CPU allowance per request. Logins and photos are far inside it. Large video uploads are the one thing I could not test against Cloudflare's real limit. Try one 10 MB clip after deploying. If it fails, lower the video limit (`LIMITS.video` in `worker/core.js`) or use YouTube for video.
- Wrong-password lockout (5 tries, 15 minutes) is kept in the Worker's memory. It slows guessing a lot, but it can reset when Cloudflare restarts the Worker. Use passwords that are long, not short ones.
- The GitHub token can only touch the `CAW-media` repo. If it ever leaks, delete it on GitHub and make a new one.
