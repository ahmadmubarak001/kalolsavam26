# Supabase live publishing setup (v3)

This project can run as a static demo, or connect to Supabase so public visitors see shared events, published results and website content across devices. GitHub Pages does not provide a database by itself.

## 1. Create a Supabase project
1. Create a project at https://supabase.com/dashboard.
2. Open **SQL Editor**, paste all of `schema.sql`, and run it.
3. Open **Project Settings → API** (or Connect) and copy the project URL and publishable/anon key.
4. Put those values into `supabase-config.js` in `url` and `anonKey`. The publishable/anon key is intended for browser use when Row Level Security is configured. Never use a `service_role` or secret key here.

## 2. Create a secure admin account
1. In **Authentication → Users**, create the administrator with email and a strong password. Disable public sign-ups in Authentication settings.
2. Give that user the server-controlled `app_metadata` value `{ "role": "admin" }`. Do this using a trusted server-side Admin API or a secure server-side script with the service-role key kept only in a private environment. Never put the service-role key in this repository or browser code.
3. Confirm the user's JWT contains `app_metadata.role = admin` after signing in. Only this role passes the SQL write policies.

Do not grant the role using user-editable `user_metadata`. Do not expose the service-role key in a GitHub repository.

## 3. Publish on GitHub Pages
Upload `index.html`, `styles.css`, `app.js`, `supabase-config.js`, `cloud.js`, `schema.sql`, `.nojekyll`, and the docs to your repository root. Commit your configured project URL and anon/publishable key only after reviewing repository visibility and security requirements. Enable **Settings → Pages → Deploy from a branch → main → /(root)**.

## 4. Use the site
- Visitors see events and published results; drafts are protected by Row Level Security.
- Admin signs in with the Supabase email and password using **Admin Panel**.
- Save event/result/site changes to sync to the shared tables. Changes are refreshed when Supabase reports a database update.
- If cloud configuration is blank, the app falls back to local demo storage and the demo login. That fallback is not secure and must not be used for real student data.

## Important limitations
- This is a static site with a browser Supabase client; security depends on the SQL policies and proper admin role setup. Test policies with an ordinary anonymous session and a non-admin authenticated account before going live.
- The admin save routine replaces the current event/result tables to keep the simple editor in sync. Use a dedicated admin account and avoid simultaneous edits from multiple administrators. For multi-admin production use, replace this with per-record upserts/deletes and audit logging.
- Use only real, approved school results. The included sample participants/results are demo content; remove them before publishing.
