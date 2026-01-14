# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Birthday Quest is a mobile-first PWA puzzle game built with Vite + React Router. Players complete quests across three themed paths to collect keys and unlock a vault. Built as a special birthday surprise gift with Supabase database-first architecture for cross-device sync.

**Tech Stack**: Vite, React 19, React Router v7, TypeScript, Tailwind CSS v3, Framer Motion, Zustand, Supabase (PostgreSQL), canvas-confetti, Lucide icons

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server on :3000

# Database (Drizzle CLI - schema only, Supabase for runtime)
npm run db:push          # Push schema to database (development)
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations (production)
npm run db:studio        # Open Drizzle Studio (visual DB editor)

# Progress Management
npm run reset:client     # Clear client localStorage only
npm run reset:db         # Clear database progress only
npm run reset:all        # Clear both client + database

# Build & Deploy
npm run build            # Production build
npm run preview          # Preview production build locally
npm run lint             # Run ESLint

# PWA
npm run generate-icons   # Generate PWA icons from source
```

## Architecture Overview

### State Management & Data Flow (Database-First)

**Supabase Database** (Single Source of Truth):
- `profiles` table: Agent authentication with secret codes
- `active_sessions` table: Live progress tracking with shuffled puzzle queues
- `quest_progress` table: Permanent completion records per path (written when 93%+ mastery achieved)

**Zustand Store** (`src/store/useQuestStore.ts`):
- Client-side reactive state layer
- Persists **only** `agentId` to localStorage (everything else from database)
- Optimistic updates: UI updates immediately, database syncs in background
- Key state: `keysCollected`, `pathProgress`, `isVaultUnlocked`, `currentPuzzleId`
- Key actions: `addKey()`, `submitAnswer()`, `skipPuzzle()`, `hydrateFromDatabase()`

**Data Flow**:
```
User Login → QuestHydration component
  → Authenticate via secret code (Supabase)
  → hydrateFromDatabase(agentId)
  → Populate Zustand from database
  → UI renders with synced progress

User Submits Answer → submitAnswer()
  → [OPTIMISTIC] Update Zustand immediately
  → [BACKGROUND] syncSessionProgress() to Supabase
  → Check if 93% threshold reached → auto-unlock key
```

### Mission Start System

**Core Logic** (`src/lib/mission.ts`):
- `MISSION_START_DATE` environment variable controls when access terminal unlocks
- Set via `VITE_MISSION_START_DATE` (default: `2026-01-13T08:00:00`)
- Functions: `isMissionActive()`, `getMillisecondsUntilStart()`
- Landing page (`src/pages/LandingPage.tsx`) shows countdown until mission start

**Important**: For testing, set past dates. Before launch, set to actual birthday.

### Quest Engine & Puzzle System

**Puzzle Types** (`src/types/puzzle.ts`):
- Three types: `multiple-choice`, `text-input`, `image-reveal`
- All inherit from `BasePuzzle` with `question`, `hint`, `successMessage`, `points`, `difficulty`
- Stored as TypeScript objects in `src/data/puzzles/` directory

**Puzzle Data Structure**:
```
src/data/puzzles/
├── pop-culture.ts    # Friends & Gilmore Girls puzzles
├── renaissance.ts    # General knowledge puzzles
├── heart.ts          # Personal memory puzzles (customizable)
└── index.ts          # Exports getPathPuzzles(), getPuzzleById(), TARGET_SCORES
```

**Quest Flow (GAUNTLET MODE)**:
1. User logs in via secret code → navigates to `/hub`
2. User clicks path card → navigates to `/quest/:pathId`
3. Quest page loads **random unsolved puzzle** (not sequential)
4. `PuzzleRenderer` dynamically renders appropriate puzzle type
5. User submits answer → `validateAnswer()` checks correctness with Levenshtein distance fuzzy matching
6. Correct answer → confetti + load next random unsolved puzzle
7. Score tracking → when score >= 93% threshold (TARGET_SCORES) → auto-unlock key
8. Path completion → `addKey(pathId)` updates Zustand + syncs to Supabase

**Two-Strike Mercy System**:
- First incorrect answer: Warning message + shake animation
- Second incorrect answer: Auto-skip puzzle (saved to `skippedIds` for later retry)

**Non-Linear Navigation**:
- `QuestionNavigator` component shows remaining unsolved puzzles
- Users can jump between puzzles freely
- `getNextUnsolvedPuzzle()` returns random puzzle from pool
- Completed/skipped puzzles vanish from navigation (Dynamic Vanishing)

### Vault Unlock & Reveal

**Vault Unlock Detection**:
- Zustand tracks `keysCollected` array and `isVaultUnlocked` boolean
- `checkVaultStatus()` sets `isVaultUnlocked = true` when `keysCollected.length === 3`
- Vault Hub (`/hub`) shows "Open Vault" button when unlocked + fires confetti

**Vault Reveal Sequence** (`src/pages/VaultReveal.tsx` + `src/components/vault/VaultReveal.tsx`):
- Multi-stage animated sequence with confetti bursts
- Uses canvas-confetti with path-themed colors from `PATH_METADATA`
- Final "Reveal My Gift" button (destination customizable)

## Key Architectural Patterns

### React Router v7 Params Handling
Route params are accessed via `useParams()` hook:
```typescript
const QuestPage = () => {
  const { pathId: pathIdString } = useParams<{ pathId: string }>();
  const pathId = parseInt(pathIdString!) as PathId;
  // ...
}
```

### Path Metadata System
All path configuration lives in `src/store/useQuestStore.ts`:
- `PATH_IDS`: Constant object from `src/lib/paths.ts` (1, 2, 3)
- `PATH_METADATA`: Theme colors, titles, subtitles, unlock days
- Used throughout app for theming and display

### Puzzle Validation
`src/lib/puzzle-validator.ts` handles answer checking:
- Text answers: Levenshtein distance algorithm for fuzzy matching
- Scaled thresholds based on answer length (1-3 edits allowed)
- Three statuses: `correct`, `close` (spelling error), `incorrect`
- Multiple acceptable answers supported via `acceptableAnswers` array
- Returns `{ isCorrect, status, message, showHint, distance }`

### Animation Strategy
- Framer Motion for all page transitions and component animations
- canvas-confetti for celebrations (correct answers, vault unlock, reveal)
- Animations use path-specific colors from `PATH_METADATA`
- Shake animations for incorrect answers

### Cross-Device Sync
Database-first architecture enables cross-device progress sync:
- All progress stored in Supabase (not localStorage)
- Users authenticate via secret code
- Same code works across all devices
- See `DATABASE_FIRST_ARCHITECTURE.md` for full details

### PWA Configuration
Vite PWA plugin (`vite.config.ts`):
- Service worker for offline support
- Manifest for installability
- Icons generated via `npm run generate-icons`
- Auto-update registration type

## Important Files & Their Roles

**Pages & Routing**:
- `src/App.tsx`: React Router setup with 4 routes
- `src/pages/LandingPage.tsx`: Mission countdown + secret code login
- `src/pages/VaultHub.tsx`: Main dashboard showing 3 key slots and progress
- `src/pages/QuestPage.tsx`: Quest Engine - renders puzzles and handles progression
- `src/pages/VaultReveal.tsx`: Final celebration sequence

**Core Components**:
- `src/components/QuestHydration.tsx`: Database hydration on app load (critical)
- `src/components/KeySlot.tsx`: Animated key slot with lock/unlock states
- `src/components/puzzles/PuzzleRenderer.tsx`: Dynamic puzzle component selector
- `src/components/puzzles/QuestionNavigator.tsx`: Non-linear navigation UI
- `src/components/quest/AchievementStakes.tsx`: Live mistake counter and achievement progress
- `src/components/vault/VaultReveal.tsx`: Multi-stage vault opening animation

**State & Data**:
- `src/store/useQuestStore.ts`: Zustand global state with database sync
- `src/lib/supabase-sync.ts`: Database sync functions
- `src/db/schema.ts`: Drizzle schema definitions
- `src/db/index.ts`: Supabase client initialization

**Game Logic**:
- `src/lib/mission.ts`: Mission start date logic and countdown
- `src/lib/puzzle-validator.ts`: Answer validation with fuzzy matching
- `src/lib/paths.ts`: Path ID constants and type definitions
- `src/data/puzzles/*.ts`: Puzzle content for each path

## Environment Variables

Required in `.env.local`:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Mission Start Date (Optional - defaults to 2026-01-13T08:00:00)
VITE_MISSION_START_DATE=2026-01-20T08:00:00

# Database URL for Drizzle CLI (Optional - only needed for migrations)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

## Customization Points

**Before Launch**:
1. **Heart Path** (`src/data/puzzles/heart.ts`): Replace placeholder puzzles with real relationship memories
2. **Mission Start Date**: Set `VITE_MISSION_START_DATE` to actual birthday
3. **Final Reveal** (`src/pages/VaultReveal.tsx`): Customize "Reveal My Gift" button destination
4. **Secret Codes**: Add profiles to Supabase `profiles` table with unique `secret_code` values

**Path Colors**: Edit `PATH_METADATA` in `src/store/useQuestStore.ts`
**Puzzle Content**: Edit files in `src/data/puzzles/` directory

## Testing

See `TESTING_GUIDE.md` for comprehensive testing instructions.

**Quick Test**: Complete all 3 paths in sequence, watch vault unlock and reveal.

**Reset Progress**:
```bash
# Client only (localStorage)
npm run reset:client

# Database only
npm run reset:db

# Both
npm run reset:all
```

## Common Gotchas

1. **Database-First Architecture**: Progress lives in Supabase, not localStorage. Always sync to database on state changes.
2. **Mission Start Date**: Check `VITE_MISSION_START_DATE` if access terminal isn't unlocking
3. **Secret Code Auth**: Users must enter correct code from `profiles.secret_code` column
4. **Gauntlet Mode**: Puzzles load in random order, not sequential. Score-based completion (93% threshold).
5. **Two-Strike System**: First wrong answer warns, second auto-skips (not instant fail)
6. **Puzzle Points**: Each puzzle has points value. `TARGET_SCORES` represents 93% of max points per path.
7. **Supabase Mocks**: Vite build uses mocks (`src/lib/mocks/`) to avoid server-only module errors
8. **Text Matching**: Use `acceptableAnswers` array for alternative spellings/variations
9. **Confetti Timing**: Confetti needs slight delays to avoid overlapping animations
10. **God Mode**: `isTester` flag in profiles enables ghost mode UI (cyan theme, skip validations)

## Code Style

- Use `const` arrow functions for components: `const MyComponent = () => { ... }`
- TypeScript for all definitions
- Early returns for readability
- All components are client-side (no SSR in Vite)
- Framer Motion for animations, not CSS transitions
- Icons from `lucide-react` only
- Always use Lucide icons over emojis (per user instructions)
