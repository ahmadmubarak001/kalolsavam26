# LPS VILAKKUPARA Kalolsavam Results Portal — v3.0

GitHub Pages-ready public results portal and admin editor, with an optional Supabase shared backend.

## What's new in v3
- Optional Supabase Auth email/password sign-in for admins.
- Shared event, result and website-setting tables for cross-device publishing.
- Public result visibility is restricted to published rows by Row Level Security (RLS).
- Realtime refresh for event/result/site changes.
- Keeps the public site, website editor, event/result CRUD, filters, CSV export, printing, and JSON backup/restore.
- Local demo mode remains available when Supabase is not configured.

## Quick test
Open `index.html` in a browser. Without Supabase configuration, it uses local browser storage and demo login. This mode is for preview only.

## Live setup
Follow **SUPABASE-SETUP.md** in order and run `schema.sql` in Supabase SQL Editor. Set the project URL and publishable/anon key in `supabase-config.js`. Create an admin account and set server-controlled `app_metadata.role` to `admin`; never expose a service-role key in frontend code.

## GitHub Pages
Upload the project files to the repository root, then enable **Settings → Pages → Deploy from a branch → main → /(root)**.

## Before going live
Delete sample data, test RLS as anonymous / non-admin / admin, use strong unique admin credentials, and keep backups private. GitHub Pages is static hosting; Supabase provides the shared database and authentication.
