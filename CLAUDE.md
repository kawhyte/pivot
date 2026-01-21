# CLAUDE.md — Birthday Quest (High-Efficiency)

## Project Overview
Mobile-first PWA puzzle game built with Vite + React Router. Features a Supabase database-first architecture with a tiered reward system for a birthday surprise.


## 🛑 STRICT UI & VISUAL LOCK
- **Preserve Current UI:** Maintain all existing CSS, Tailwind classes, and Framer Motion configurations.
- **Icon Policy:** Use Lucide icons exclusively. Strictly NO emojis in code or UI.
- **Focus:** 100% on logical state management and Supabase data synchronization.
- **Goal:** Focus 100% on logical state management and database synchronization.
- **Visuals:** Maintain current aesthetic. Use Lucide Icons only. No emojis.



## Critical Context
- **Core Loop:** - **Core Loop:** Auth → Hub → Path → 100% Completion (Key Unlocked) → Success Screen (Fork) → Optional: Sudden Death (Gift Upgrade Unlock) → Vault Reveal.
- **Gifting Tier Logic:** - **Tier 1 (Base):** 100% completion = Path Key Unlocked (`is_key_unlocked: true`).
    - **Tier 2 (VIP):** Sudden Death Clear = Bonus Reward (`is_bonus_unlocked: true`).
    - **Failure State:** Sudden Death fail denies the VIP upgrade but NEVER revokes the Base Key.
- **Data Source:** Supabase (PostgreSQL) is the single source of truth. Zustand persists `agentId` only.


## Tech Stack
- **Frontend:** React 19, Vite, React Router v7, TypeScript, Tailwind v3, Framer Motion.
- **State/Data:** Zustand (Client), Supabase (Remote), Drizzle (Schema Management).
- **Visuals:** Lucide Icons (Required), canvas-confetti. **Strictly No Emojis.**

## Technical Rules
- **Logic Location:** Centralize all sync logic in `src/store/useQuestStore.ts` and `src/lib/supabase-sync.ts`.
- **Validation:** Use `src/lib/puzzle-validator.ts` for Levenshtein/Fuzzy matching.
- **Component Pattern:** Use functional arrow functions with early returns for logic branches.
- **Sync Strategy:** Perform optimistic Zustand updates followed immediately by background Supabase persistence.



## Architectural Map
- **Auth:** Validate via `profiles.secret_code`.
- **Gauntlet Mode:** Non-linear selection. 100% puzzle coverage is required for Key Unlock.
- **Mercy System:** Two-strike system (Warning → Auto-skip to `skippedIds`).
- **Sudden Death:** Optional phase triggered post-100%. Failure does NOT revoke Key.
- **Animations:** Framer Motion (Transitions/Shake), canvas-confetti (Celebrations).
- **Success Screen UI:** Must clearly present two paths: 
    1. "Claim My Key & Continue" (Safe Path).
    2. "Risk it for the VIP Upgrade" (Sudden Death Entry).
- **Data Logic:** Track `is_bonus_unlocked` as a boolean in `quest_progress` to determine which "Gift Reveal" video or text to show in the final Vault.
- **Sync:** Ensure the "Upgrade" status persists in Supabase so it can't be "cheated" by refreshing.
- **Vault Logic:** Condition the "Gift Reveal" content solely on `is_key_unlocked` and `is_bonus_unlocked` flags.


## File Priority
- **State & Sync:** `src/store/useQuestStore.ts`, `src/lib/supabase-sync.ts`.
- **Navigation:** `src/pages/QuestPage.tsx`, `src/components/puzzles/QuestionNavigator.tsx`.
- **Success UI:** `src/pages/SuccessScreen.tsx` (Handles Key vs. Bonus CTAs).
- **Database:** `SCHEMA.md` (SQL/JSONB Reference).

## Development & Testing
- **God Mode:** `isTester` flag in profile enables bypass UI/validations.
**Dev:** `npm run dev` (Port 3000)
- **DB Sync:** `npm run db:push`
- **Full Reset:** `npm run reset:all` (Clears localStorage and all Supabase progress).

### Animation Strategy
- Framer Motion for all page transitions and component animations
- canvas-confetti for celebrations (correct answers, vault unlock, reveal)
- Animations use path-specific colors from `PATH_METADATA`
- Shake animations for incorrect answers


Respond with minimal prose. Provide only the code changes and a brief 1-sentence explanation of why the change was made.