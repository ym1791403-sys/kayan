# Security Policy

## Reporting a vulnerability
Do NOT open a public issue. Contact the site owner privately.

## Rules for this repository
- Never commit passwords, service-account JSON files, or `.env` files (see `.gitignore`).
- The Firebase web config in `index.html` is a public client config by design.
  Real protection = `database.rules.json` + Firebase Authentication + App Check.
- The admin password lives only in Firebase Authentication, never in code.

## Checklist after every deploy
1. `database.rules.json` is published in Realtime Database > Rules.
2. Authentication > Settings > User actions: "Enable create (sign-up)" is OFF.
3. API key restricted to the site domain (Google Cloud Console > Credentials).
4. App Check enabled and ENFORCED for Realtime Database.
5. Admin password is long and unique.
6. `npm run test:static` passes.
