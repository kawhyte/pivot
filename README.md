# Birthday Quest - The Vault 🎁

A beautiful, interactive PWA puzzle game built for a special birthday surprise. Players collect 3 keys by completing daily quests across three themed paths.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **Animations**: Framer Motion
- **State**: Zustand with localStorage persistence
- **Database**: PostgreSQL with Drizzle ORM
- **Icons**: Lucide React

## Project Structure

```
pivot/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   └── page.tsx            # Vault Hub (main dashboard)
├── components/
│   └── KeySlot.tsx         # Animated key slot component
├── db/
│   ├── schema.ts           # Drizzle schema definitions
│   └── index.ts            # Database connection
├── lib/
│   └── daily-drop.ts       # Daily unlock logic utilities
└── store/
    └── useQuestStore.ts    # Zustand global state
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Core dependencies
npm install drizzle-orm postgres zustand framer-motion canvas-confetti lucide-react date-fns

# Dev dependencies
npm install -D drizzle-kit @types/canvas-confetti
```

### 2. Configure Environment

Create a `.env.local` file (copy from `.env.example`):

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
SECRET_ACCESS_KEY="birthday2026"
```

### 3. Set Up Database

Generate and push the schema to your database:

```bash
npm run db:push
```

Or generate migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see The Vault!

## Features Implemented (Phase 1 & 2)

✅ **Database Schema**
- Users table with secret code authentication
- Quest progress tracking for all 3 paths

✅ **State Management**
- Zustand store with localStorage persistence
- Path unlocking, key collection, and level tracking

✅ **Daily Drop System**
- Time-based path unlocking (Jan 20, 21, 22)
- Countdown timers for locked paths
- Automatic unlock detection

✅ **Vault Hub UI**
- Beautiful mobile-first design
- 3 animated key slots with Framer Motion
- Progress indicator (0/3 → 3/3)
- Vault unlock celebration screen

## Configuration

### Start Date

The quest start date is set in `lib/daily-drop.ts`:

```typescript
export const START_DATE = new Date('2026-01-20T00:00:00');
```

### Path Colors

Colors are defined in `store/useQuestStore.ts` under `PATH_METADATA`:

- **Pop Culture**: Purple `#6366f1` / Yellow `#fbbf24`
- **Renaissance**: Emerald `#065f46` / Gold `#d4af37`
- **Heart**: Crimson `#be123c` / Rose `#fb7185`

## Next Steps (Phase 3+)

- [ ] Implement Quest Engine (JSON-driven puzzle renderer)
- [ ] Create path-specific puzzle content
- [ ] Add secret URL authentication (`?key=birthday2026`)
- [ ] Build the final Vault unlock experience with confetti
- [ ] Add audio/haptic feedback
- [ ] PWA manifest and service worker

## Drizzle Studio

View and edit your database visually:

```bash
npm run db:studio
```

---

Made with love for a special birthday 💝
