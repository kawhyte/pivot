# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Birthday Quest is a mobile-first PWA puzzle game built with Next.js 15 App Router. Players collect 3 keys by completing daily-unlocking quest paths over 3 days, culminating in a vault reveal celebration. Built as a special birthday surprise gift.

**Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand, Drizzle ORM + PostgreSQL, canvas-confetti, Lucide icons

## Development Commands

```bash
# Development
npm run dev              # Start dev server on :3000

# Database
npm run db:push          # Push schema to database (development)
npm run db:generate      # Generate migration files
npm run db:migrate       # Run migrations (production)
npm run db:studio        # Open Drizzle Studio (visual DB editor)

# Build & Deploy
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

## Architecture Overview

### State Management & Data Flow

**Zustand Store** (`store/useQuestStore.ts`):
- Single source of truth for quest state
- Persisted to localStorage via `persist` middleware
- Key state: `keysCollected`, `isVaultUnlocked`, `pathLevels`, `unlockedPaths`
- Actions: `addKey()`, `updatePathLevel()`, `setActivePath()`, `checkVaultStatus()`

**Database Schema** (`db/schema.ts`):
- `users` table: Authentication via secret code
- `quest_progress` table: Tracks user completion per path
- Currently, the app relies on client-side Zustand state; database can be used for server-side persistence if needed

### Daily Unlock System

**Core Logic** (`lib/daily-drop.ts`):
- `START_DATE` constant controls when quest begins
- Calculates which paths unlock on which days (Pop Culture=Day 1, Renaissance=Day 2, Heart=Day 3)
- Functions: `getCurrentQuestDay()`, `getUnlockedPaths()`, `isPathUnlocked()`, `getHoursUntilUnlock()`
- Vault Hub (`app/page.tsx`) calls `getUnlockedPaths()` on mount and updates Zustand store

**Important**: For testing, `START_DATE` can be set to past dates. Before launch, must be set to actual birthday: `new Date('2026-01-20T00:00:00')`

### Quest Engine & Puzzle System

**Puzzle Types** (`types/puzzle.ts`):
- Three types: `multiple-choice`, `text-input`, `image-reveal`
- All inherit from `BasePuzzle` with `question`, `hint`, `successMessage`
- Stored as JSON-like TypeScript objects in `data/puzzles/` directory

**Puzzle Data Structure**:
```
data/puzzles/
├── pop-culture.ts    # 5 Friends & Gilmore Girls puzzles
├── renaissance.ts    # 5 General knowledge puzzles
├── heart.ts          # 5 Personal memory puzzles (customizable)
└── index.ts          # Exports getPathPuzzles(), getPuzzle(), getTotalPuzzles()
```

**Quest Flow**:
1. User clicks path on Vault Hub → navigates to `/quest/[pathId]`
2. Quest page (`app/quest/[pathId]/page.tsx`) uses `React.use()` to unwrap Next.js 15 async params
3. Loads puzzle via `getPuzzle(pathId, currentLevel - 1)`
4. `PuzzleRenderer` component dynamically renders appropriate puzzle type
5. User submits answer → `validateAnswer()` checks correctness (`lib/puzzle-validator.ts`)
6. Correct answer → confetti + advance to next puzzle OR show completion screen
7. Path completion → `addKey(pathId)` updates Zustand → key appears on Vault Hub

### Vault Unlock & Reveal

**Vault Unlock Detection**:
- Zustand store tracks `keysCollected` array and `isVaultUnlocked` boolean
- `checkVaultStatus()` action sets `isVaultUnlocked = true` when `keysCollected.length === 3`
- Vault Hub (`app/page.tsx`) shows "Open Vault" button when unlocked + fires confetti

**Vault Reveal Sequence** (`app/vault/page.tsx` + `components/vault/VaultReveal.tsx`):
- Multi-stage animated sequence (8 seconds total)
- Stage 1: "Unlocking..." animation (1.5s)
- Stage 2: "The Vault Opens!" with confetti burst (2.5s)
- Stage 3: "Your Birthday Surprise..." anticipation (2s)
- Stage 4: Final birthday message with "Reveal My Gift" button
- Uses canvas-confetti for celebrations with path-themed colors

## Key Architectural Patterns

### Next.js 15 Params Handling
**Critical**: Route params are now Promises in Next.js 15. Always unwrap with `React.use()`:
```typescript
const QuestPage = ({ params }: { params: Promise<{ pathId: string }> }) => {
  const { pathId } = use(params);
  // ...
}
```

### Path Metadata System
All path configuration lives in `store/useQuestStore.ts`:
- `PATH_IDS`: Constant object mapping path names to IDs (1, 2, 3)
- `PATH_METADATA`: Theme colors, titles, unlock days
- Used throughout app for theming and display

### Puzzle Validation
`lib/puzzle-validator.ts` handles answer checking:
- Text answers: case-insensitive, trimmed, normalized whitespace
- Multiple choice: index matching
- Returns `{ isCorrect, message, showHint }` for UI feedback

### Animation Strategy
- Framer Motion for all page transitions and component animations
- canvas-confetti for celebrations (correct answers, vault unlock, reveal)
- Animations use path-specific colors from `PATH_METADATA`

## Important Files & Their Roles

- `app/page.tsx`: Vault Hub - main dashboard showing 3 key slots and progress
- `app/quest/[pathId]/page.tsx`: Quest Engine - renders puzzles and handles progression
- `app/vault/page.tsx`: Vault Reveal - final celebration sequence
- `components/KeySlot.tsx`: Animated key slot with lock/unlock states and countdown
- `components/puzzles/PuzzleRenderer.tsx`: Dynamic puzzle component selector
- `lib/daily-drop.ts`: Daily unlock logic and date calculations
- `lib/puzzle-validator.ts`: Answer validation with fuzzy matching
- `data/puzzles/*.ts`: Puzzle content for each path

## Customization Points

**Before Launch**:
1. **Heart Path** (`data/puzzles/heart.ts`): Replace placeholder puzzles with real relationship memories (see `HEART_PATH_CUSTOMIZATION.md`)
2. **Start Date** (`lib/daily-drop.ts`): Set `START_DATE` to actual birthday
3. **Final Reveal** (`app/vault/page.tsx`): Customize "Reveal My Gift" button destination

**Path Colors**: Edit `PATH_METADATA` in `store/useQuestStore.ts`
**Puzzle Content**: Edit files in `data/puzzles/` directory

## Testing

See `TESTING_GUIDE.md` for comprehensive testing instructions.

**Quick Test**: Complete all 3 paths in sequence, watch vault unlock and reveal.

**Reset State**: Clear localStorage to reset progress:
```javascript
localStorage.clear(); location.reload();
```

## Common Gotchas

1. **Params are Promises**: Always use `React.use(params)` in Next.js 15 route components
2. **Date-based Unlocking**: Check `START_DATE` if paths aren't unlocking as expected
3. **State Persistence**: Zustand persists to localStorage - clear it to reset progress
4. **Puzzle Indexes**: Multiple choice `correctAnswer` is 0-based index, not 1-based
5. **Text Matching**: Use `acceptableAnswers` array for alternative spellings/variations
6. **Confetti Timing**: Confetti needs slight delays to avoid overlapping animations

## Code Style

- Use `const` arrow functions for components: `const MyComponent = () => { ... }`
- TypeScript for all definitions
- Early returns for readability
- Client components must have `'use client'` directive
- Framer Motion for animations, not CSS transitions
- Icons from `lucide-react` only
