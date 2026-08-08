# Shivrakshak Academy

Next.js application backed by Supabase Auth, Postgres, and private Storage.

## Security setup

1. Create the initial schema with `SUPABASE-SETUP.sql`.
2. Review the production preflight, back up the database and Storage objects, and
   reconcile duplicate `documents(student_id, doc_type)` records manually. Do not
   rerun `SUPABASE-SETUP.sql` against an existing database.
3. In **Supabase Dashboard → Storage → Buckets**, prepare these buckets before the
   migration. Create a missing bucket with **New bucket**; do not rename or delete
   an existing bucket or object:

   | Bucket | Public setting | File limit | Allowed MIME types |
   | --- | --- | --- | --- |
   | `student-documents` | Leave unchanged until the SQL succeeds; then turn **Public bucket OFF** | 10 MB | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |
   | `student-photos` | **Public bucket ON** | 10 MB | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |
   | `notice-attachments` | **Public bucket ON** | 10 MB | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |

4. Create the admin in Supabase Authentication with email/password.
5. In the Supabase SQL Editor, assign the role using the user's UUID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where id = '<ADMIN_USER_UUID>';
```

Sign out and sign in again after assigning the role so the JWT contains the new claim. Never put an admin password or the service-role key in a `NEXT_PUBLIC_` variable.

6. In the SQL Editor, inventory `pg_policies` for `storage.objects`. If the
   migration reports legacy generic policies, inspect their bucket predicates and
   remove only policies confirmed to belong exclusively to this academy. Preserve
   every policy used by another bucket or application.
7. Apply the complete `supabase/security-hardening.sql` transaction. Do not run
   selected fragments.
8. After the SQL succeeds, return to **Storage → Buckets → student-documents →
   Configuration**, turn **Public bucket OFF**, save, and verify that an old public
   URL fails while an authenticated admin signed URL works. The migration does not
   modify `storage.buckets` directly.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
