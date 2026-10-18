# Staff login: one password

Staff open the lock icon on the site and type one shared password. There are no usernames. This replaces the username steps in `STAFF_MEDIA_SETUP.md`.

## Set or change the password (easiest: on Cloudflare)

1. Cloudflare dashboard > **Workers & Pages** > `caw-staff-api` > **Settings** > **Variables and Secrets**.
2. Add (or edit) a **Secret** named `STAFF_PASSWORD` and type the new password. Save and deploy.
3. The change is live in under a minute. Anyone already signed in is signed out after 12 hours.

## Or from your computer

```
cd worker
npx wrangler secret put STAFF_PASSWORD
```

## First-time setup

```
cd worker
npx wrangler login
npx wrangler deploy
npx wrangler secret put STAFF_PASSWORD
npx wrangler secret put SESSION_SECRET
```

Make the `SESSION_SECRET` with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Then, in the website project's build settings, add `VITE_STAFF_API_URL` (the Worker address) and rebuild.

## Notes

- Use a long password. Five wrong tries lock that device out for 15 minutes.
- Everyone shares the password, so change it when someone leaves.
- Photo and video uploads need extra setup (`GITHUB_TOKEN`) and are switched off until storage is chosen.
