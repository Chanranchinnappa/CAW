# Photos, videos and the live projects board (Cloudflare R2)

Everything lives in one R2 bucket called `caw-media`, reached only through the staff API Worker.

## One-time setup

1. Cloudflare dashboard > **Storage & databases** > **R2 object storage** > turn R2 on (Cloudflare may ask for a payment method; the free allowance below still applies).
2. In a terminal in the project folder:

```
cd worker
npx wrangler r2 bucket create caw-media
npx wrangler deploy
cd ..
```

`wrangler.toml` already connects the bucket to the Worker as `MEDIA`. No other secrets are needed.

## What it costs

Free every month: 10 GB stored, 1 million writes, 10 million reads, and no charge for data going out. After that: about $0.015 per GB per month. The Worker serves the files, so visits count against the Worker's free 100,000 requests a day.

## What staff can do (staff page > Finished builds)

- Add photos and videos (videos up to 1 GB each, sent in 8 MB pieces).
- Show or hide a file on the website, archive it, delete it for good, set the cover photo.
- Show, hide, archive or delete a whole finished build.

## Live projects board

The board on the staff page is saved to the same bucket, so every phone sees the same board and so does the public site.
