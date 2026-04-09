# Tech Stack Selection (2026)

> Default and alternative technology choices for web applications.

## Primary Stack (Web App - 2026)

```yaml
Frontend:
  framework: Next.js 16 (Full-stack) / React + Vite (Webflow Sync)
  language: TypeScript 5.7+
  styling: Vanilla CSS (Client-First) for Webflow / Tailwind v4 for Apps
  bundler: Vite (Preferred for Webflow) / Turbopack (Next.js)

Backend:
  runtime: Node.js 23
  framework: Next.js API Routes / Hono (for Edge)

Database:
  primary: PostgreSQL
  orm: Prisma / Drizzle
  hosting: Supabase / Neon

Auth:
  provider: Auth.js (v5) / Clerk
```

## Webflow Sync Strategy

```yaml
Framework: React 19 + Vite
Styling: Vanilla CSS (Finsweet Client-First)
Build: npm run build (Single HTML/JS/CSS output)
Requirement: Clean, semantic HTML and CSS for direct import.
```

## Alternative Options

| Need | Default | Alternative |
|------|---------|-------------|
| Real-time | - | Supabase Realtime, Socket.io |
| File storage | - | Cloudinary, S3 |
| Payment | Stripe | LemonSqueezy, Paddle |
| Email | - | Resend, SendGrid |
| Search | - | Algolia, Typesense |
