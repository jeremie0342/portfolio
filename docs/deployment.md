# Deployment

The site, its database and its object store run on one machine, described by
`compose.yaml` and built by `Dockerfile`. This document is the order to do
things in, and the reasons for the two or three steps that are not obvious.

Target: `https://zardonis.skill-uv.com`, on a VPS running Coolify.

## What has to be true before anything else

**The origin is decided at build time, not at run time.** `NEXT_PUBLIC_SITE_URL`
ends up inside the built pages: every canonical URL, every language alternate,
every entry in the sitemap, the share images and the links inside the
curriculum vitae. Setting it only as a runtime variable produces a site whose
every address points at `localhost`, and nothing about it looks broken until a
search engine reads it. It is passed as a build argument in `compose.yaml`;
in Coolify it must be marked as a **build variable**, not only a runtime one.

**The build does not read the database.** Nothing is prerendered from it: a
page is rendered on its first request and kept for an hour.

That is a deliberate reversal, and it was learned the hard way. Prerendering
meant the build needed a database that was migrated and filled, which on a
first deployment does not exist yet, because the deployment that would create
it is the one waiting on the build. The way out of the circle was to take the
database out of the build.

What it costs: the first visitor to a page after a deployment waits for a
render rather than receiving a file, a few hundred milliseconds, once per page
per hour. What it buys: a build that cannot fail for want of a service, no
ordering to respect, and one connection string instead of two.

## DNS

Two records, both pointing at the server:

```
zardonis.skill-uv.com         A     <server address>
media.zardonis.skill-uv.com   A     <server address>
```

The second serves the object store. It is a separate name because a browser
fetches uploaded images directly from MinIO, and the origin it fetches them
from is not the one the server writes to.

Resend adds its own records on `skill-uv.com`. They are given by its dashboard
when the domain is added, and mail does not leave until they resolve.

## Secrets

Generated once, on a machine you trust, and never regenerated afterwards
without knowing what it costs.

```bash
npm run console:secrets     # CONSOLE_PATH, ADMIN_PASSWORD_HASH, AUTH_SECRET
openssl rand -hex 24        # POSTGRES_PASSWORD
openssl rand -hex 24        # MINIO_ROOT_PASSWORD
```

Hexadecimal rather than base64. The Postgres password travels inside a
connection URL, where the `+` and `/` that base64 produces are ambiguous and
produce an authentication failure that explains nothing. Avoid `$` in any of
these for a related reason: Compose reads it as the start of a variable.

The values in the local `.env` are for the machine they were made on. **They do
not travel to the server.** The digest there has been pasted into a terminal, a
console and possibly a chat window; the point of the forced password change on
first login is that a bootstrap credential is temporary, and one that has been
copied twice is not a credential at all.

`AUTH_SECRET` signs the console session cookie. Changing it later closes every
open session, which is the fastest way to lock everyone out on purpose.

## Environment

Everything below goes into Coolify's environment editor for the project.
Mark `NEXT_PUBLIC_SITE_URL` and `GITHUB_TOKEN` as build variables as well as
runtime ones: they are read while the image is built, and a runtime-only
origin produces a site whose every address says `localhost`.

```bash
# Origin, baked into the build
NEXT_PUBLIC_SITE_URL=https://zardonis.skill-uv.com

# Database
POSTGRES_USER=zardonis
POSTGRES_PASSWORD=<generated>
POSTGRES_DB=zardonis
DATABASE_URL=postgresql://zardonis:<generated>@db:5432/zardonis?schema=public

# Console
CONSOLE_PATH=<generated>
ADMIN_PASSWORD_HASH=<generated>
AUTH_SECRET=<generated>

# Mail
RESEND_API_KEY=<from resend>
MAIL_FROM=jeremie@skill-uv.com
MAIL_REPLY_TO=jeremie@skill-uv.com

# Object store
MINIO_ROOT_USER=zardonis
MINIO_ROOT_PASSWORD=<generated>
MINIO_BUCKET=media
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_PUBLIC_URL=https://media.zardonis.skill-uv.com

# The sending name belongs in Resend rather than here: angle brackets and a
# space survive neither a bulk environment editor nor Compose interpolation
# reliably.

# Optional: contribution totals come from the GraphQL API, which needs a token.
# Without one the yearly figures fall back to the values in src/lib/evidence.ts.
GITHUB_TOKEN=<read-only token, no scopes>
```

`MINIO_ENDPOINT` and `MINIO_USE_SSL` describe how the **server** reaches the
store, which is over the project network without TLS. `MINIO_PUBLIC_URL`
describes how a **browser** reaches it, which is through the proxy over HTTPS.
They are different on purpose.

## First deployment

1. Create the project in Coolify from this repository, as a **Docker Compose**
   resource, with `/compose.yaml` as the file. Choose that build pack when the
   resource is created rather than switching to it afterwards: the default is
   Nixpacks, which ignores both the Dockerfile and this file, guesses Node 22
   and fails on Prisma, and the page that changes it has been seen to throw on
   a resource that has no domain yet.
2. Paste the environment above. Mark the two build variables.
3. Point the domain at the `app` service, port 3000, and
   `media.zardonis.skill-uv.com` at the `minio` service, port 9000.
4. Deploy. Postgres publishes no port on the host: everything that needs it
   is inside the project, and `docker compose exec db …` is how a shell
   reaches it. The order is enforced by the file itself: Postgres starts, the
   `migrate` container applies the migrations and exits, the `bucket` container
   creates the bucket and opens it for reading, and only then does the server
   start.
5. Load the content once:

   ```bash
   docker compose run --rm migrate npm run db:seed:deploy
   ```

   The seed is idempotent and keyed by slug, so running it again later updates
   what `prisma/seed-data.ts` describes and removes entries it no longer
   contains. Everything written from the console afterwards is yours to keep,
   which is the reason not to run it casually.

## Checks that catch the deployment mistakes

Run these before telling anyone the site exists.

```bash
curl -s https://zardonis.skill-uv.com/sitemap.xml | head -20   # absolute, real domain
curl -sI https://zardonis.skill-uv.com/en/cv.pdf               # application/pdf
curl -sI https://zardonis.skill-uv.com/en/opengraph-image      # image/png
curl -sI https://zardonis.skill-uv.com/nothing-here            # 404, not 200
curl -s  https://zardonis.skill-uv.com/robots.txt              # Host and Sitemap on the real domain
curl -sI https://zardonis.skill-uv.com/console/wrong-path      # 404
```

If the sitemap says `localhost`, the origin was set as a runtime variable
only and the build has to be run again. Nothing else fixes it.

Then, in a browser: open `/console/<CONSOLE_PATH>`, sign in with the bootstrap
password, and change it. The console refuses to go anywhere else until you do.

## Afterwards

**Updating.** Push, redeploy. Migrations run on their own before the new server
starts; if one fails the deployment fails and the old container keeps serving.

**Backups.** Two things hold state: the database, and the MinIO volume.

```bash
docker compose exec db pg_dump -U zardonis --no-owner zardonis \
  | gzip > backup-$(date +%F).sql.gz
docker run --rm -v zardonis_media:/data -v "$PWD:/out" alpine \
  tar czf /out/media-$(date +%F).tar.gz -C /data .
```

`--no-owner` is not decoration. Without it the dump names the role that owns
the tables, and restoring it where that role does not exist stops on the first
statement. Then copy both files off the server: a backup that lives beside the
thing it protects covers a mistake and nothing else.

A backup nobody has restored is a hope rather than a backup. This one has been:
dumped from production, copied to a laptop, restored into a scratch database
and counted against the original. Sixteen projects, one world, one credential,
three positions, forty-two translations, four profiles and one console account,
on both sides.

**The pages refresh themselves** every hour, so an edit made in the console
appears within the hour without a deployment. A write from the console
revalidates the whole tree immediately, so in practice it appears at once; the
hour is the floor for anything that changes outside it, such as the GitHub
figures.
