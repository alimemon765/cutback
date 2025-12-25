# CutBack

A video feedback and approval tool for solo editors and small creative teams.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Supabase account (for database, auth, and storage)
- Resend account (for email notifications)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/alimemon765/cutback.git
cd cutback
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
   - Get your Supabase credentials from your Supabase project settings
   - Get your Resend API key from your Resend dashboard

5. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
CutBack/
├── app/                    # Next.js app directory (routes & layouts)
├── components/             # React components
│   └── ui/                # Reusable UI components
├── lib/                    # Utilities and helpers
│   └── supabase/          # Supabase client setup
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
└── prisma/ or supabase/   # Database schema (to be added)
```

## Next Steps

1. Set up Supabase database schema
2. Configure authentication
3. Implement project management features
4. Build video upload and playback
5. Add timestamp-based commenting system

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

