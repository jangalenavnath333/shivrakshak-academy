# Shivrakshak Career Academy — project handoff

Read this first if you are a new assistant or developer picking up this project.

## What this is

Next.js (App Router) + Supabase. One repository serves three things:

1. **Public site** — landing page, admission form, enquiry form
2. **Admin panel** — `/admin/*`, Supabase-auth protected
3. **Student area** — `/student/*`, online exams

Live: https://shivrakshak-academy1-kappa.vercel.app
Repo: https://github.com/jangalenavnath333/shivrakshak-academy
Branch that deploys to production: **`security-hardening`** (there is no `main`)

## Environment

`.env.local` is gitignored and stays on the owner's machine. It points at the
**production** Supabase project `thtvsqxxbkhdapaxtcqi`. There is no separate dev
database, so local work writes to live data — be careful.

Vercel holds its own copy of these variables. Note that Vercel returns
`[SENSITIVE]` for them, so `vercel env pull` cannot recover their values; get
them from the Supabase dashboard instead.

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`, `GMAIL_USER`,
`GMAIL_APP_PASSWORD`, `EMAIL_FROM`, `ADMISSION_CREDENTIAL_SECRET`,
`ADMISSION_PRINT_TOKEN_SECRET`, `CRON_SECRET`.

`NEXT_PUBLIC_APP_URL` must be this app's own origin. It was once set to the
Supabase REST URL, which made every printable-admission link return 401;
`src/lib/app-url.ts` now rejects such a value, but do not reintroduce it.

## Where to edit what

| Want to change | File |
|---|---|
| Landing text, stats, courses, gallery, founders | `src/content/landing.ts` |
| Landing look | `src/app/landing.css` (scoped under `.sra`) |
| Landing sections | `src/components/landing/*` |
| Admin look | `src/app/admin/admin.css` (scoped under `.adm`) |
| Admin shell / sidebar | `src/app/admin/(protected)/AdminShell.tsx` |

Both stylesheets are scoped, so admin styling and public styling cannot leak
into each other. Keep it that way.

## Business logic that must not break

`/api/admin/admissions` drives approve → activate → resume. Activation is a
single Postgres transaction (`activate_paid_admission`) that records the fee,
issues the student code and the print token together; re-running it does not
charge twice. `/api/admin/whatsapp` sends through Twilio server-side and must
never be replaced by `wa.me` links — `wa.me` exists only as a clearly labelled
manual fallback. Also live: fee recording, notices, mess, attendance (browser
camera + FaceDetector), the exam engine, media upload, settings.

## Known state

- **Admin panel redesign is committed but never deployed.** Commits `3ebf9da`,
  `90c0e18`, `d2707bd`, `f9c4292`. The owner asked to hold deployment.
- **Twilio is a trial account**, so WhatsApp only reaches verified numbers. The
  UI surfaces Twilio's own error text explaining this.
- Lint has 5 warnings, all pre-existing or deliberate (`<img>` on admin preview
  thumbnails with dynamic URLs).

## Still needed from the academy

1. Co-founder संभाजी महाडिक: photograph → `public/images/director/sambhaji-mahadik.jpg`,
   then set `cardPhoto`/`photo` in `DIRECTORS[1]`. His service record is
   deliberately **not** copied from the founder's — get his real one.
2. Real figures. `ACADEMY_FIGURES` currently lists only verifiable facts. No
   selection counts or success percentages exist anywhere in this project;
   do not invent them.
3. Facebook URL (the footer icon stays hidden until `facebook_url` is set).
4. Videos belong in Supabase storage via Admin → फोटो व व्हिडिओ, not in git.

## Before you ship

```
npx tsc --noEmit
npm run lint
npm run build
```

Then push to `security-hardening`; Vercel deploys that branch automatically.
Verify the live URL afterwards — do not assume a green build means a good deploy.
