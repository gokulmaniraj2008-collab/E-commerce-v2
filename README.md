# Bazario — full-stack marketplace

A general-category marketplace built with Next.js 14 (App Router), Prisma + PostgreSQL, and NextAuth.

## Features

**Shopping (customers)**
- Browse, search, filter by category, sort by price
- Product pages with images, ratings, purchase-verified reviews, "you may also like" and "customers also bought" recommendations
- Cart, wishlist, multi-step checkout with address form and payment method
- Order history and per-order tracking timeline (placed → confirmed → shipped → out for delivery → delivered), with self-service cancellation while pending

**Selling (sellers)**
- Seller hub with revenue/listing stats
- Create, deactivate, and reactivate product listings
- View and fulfill orders containing their products, advance order status

**Platform management (admin)**
- Dashboard with users/sellers/listings/orders/revenue stats
- Remove any listing from the marketplace
- View every order across the platform
- Change user roles and ban/unban accounts

**Auth & accounts**
- Email/password auth (NextAuth credentials) with hashed passwords
- Three roles: CUSTOMER, SELLER, ADMIN — route-level protection via middleware and per-endpoint checks

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up a Postgres database.** Any of these work:
   - [Neon](https://neon.tech) (free tier, easiest for Vercel)
   - [Vercel Postgres](https://vercel.com/storage/postgres)
   - [Supabase](https://supabase.com)
   - A local Postgres install

3. **Configure environment variables.** Copy `.env.example` to `.env` and fill in:
   ```
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Push the schema and seed sample data**
   ```bash
   npx prisma db push
   npm run seed
   ```
   This creates three test accounts (password for all: `password123`):
   - `admin@bazario.test` — admin console
   - `seller@bazario.test` — seller hub, already has 8 sample listings
   - `customer@bazario.test` — regular shopper

5. **Run it**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000

## Deploying to Vercel

1. Push this project to a GitHub repo.
2. Import it in Vercel.
3. Add the same three environment variables in the Vercel project settings (use your production `NEXTAUTH_URL`, e.g. `https://yourapp.vercel.app`).
4. Vercel will run `npm run build`, which runs `prisma generate` automatically. After the first deploy, run `npx prisma db push` locally against your production `DATABASE_URL` (or set up a migration step) to create the tables.

## Notes on what's simplified vs. a real Amazon-scale system

This is a genuine full-stack app — real database, real auth, real order/inventory logic — but a few things are simplified so you have a working base to extend:

- **Payments**: checkout supports COD/UPI/CARD as a selection but doesn't integrate a real payment gateway. To take real payments, wire in Razorpay or Stripe at the `/api/checkout` step.
- **Images**: products store direct image URLs rather than a file upload pipeline. Add an upload flow (e.g. Vercel Blob or Cloudinary) if you want sellers to upload photos directly.
- **Recommendations**: "customers also bought" uses simple co-purchase and category matching — solid for a growing catalog, but not a trained ML model.
- **Search**: uses Postgres `ILIKE` matching. For large catalogs, swap in a search service like Algolia or Meilisearch.

All of these are natural next steps once you're ready to scale past the prototype.
