# CLAUDE.md — Birthday Quest (High-Efficiency)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Birthday Quest is a mobile-first PWA puzzle game built with Vite + React Router. Players complete quests across three themed paths to collect keys and unlock a vault. Built as a special birthday surprise gift with Supabase database-first architecture for cross-device sync.

# CLAUDE.md — Birthday Quest (High-Efficiency)

## Critical Context
- **Concept:** Mobile-first PWA "VIP World Tour" puzzle game (Birthday Gift).
- **Core Loop:** Auth (Secret Code) → Hub → Path (3 themed) → Gauntlet (Random Puzzles) → Key Unlock (93% score) → Vault Reveal.
- **Single Source of Truth:** Supabase (PostgreSQL). Zustand persists only `agentId`.
- **Mission Lock:** Access is date-restricted via `VITE_MISSION_START_DATE` (`src/lib/mission.ts`).

## Tech Stack
- **Frontend:** React 19, Vite, React Router v7, TypeScript, Tailwind v3, Framer Motion.
- **State/Data:** Zustand (Client), Supabase (Remote), Drizzle (Schema Management).
- **Visuals:** Lucide Icons (Required), canvas-confetti. **Strictly No Emojis.**

## Token-Efficient Rules
- **Logic Priority:** All sync logic must reside in `src/store/useQuestStore.ts` or `src/lib/supabase-sync.ts`.
- **Validation:** Use `src/lib/puzzle-validator.ts` for fuzzy string matching (Levenshtein).
- **Commands:** Use `npm run dev` (Port 3000) and `npm run db:push` for schema updates.
- **Components:** Functional components with arrow functions and early returns.

## Architectural Map
- **Auth:** Validate via `profiles.secret_code`.
- **Gauntlet Mode:** Non-linear, random puzzle selection.
- **Mercy System:** Two-strike system (Warning → Auto-skip to `skippedIds`).
- **Sync:** Optimistic Zustand updates followed by background Supabase persistence.

## File Priority
- **State & Sync:** `src/store/useQuestStore.ts`, `src/lib/supabase-sync.ts`.
- **Content:** `src/data/puzzles/` (Pop, Renaissance, Heart).
- **Navigation:** `src/pages/QuestPage.tsx`, `src/components/puzzles/QuestionNavigator.tsx`.
- **Database:** `src/db/schema.ts`.

## Development & Testing
- **Setup:** Env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`.
- **Reset:** `npm run reset:all` to clear both localStorage and Supabase progress.
- **God Mode:** Use `isTester` flag in user profile for bypass UI and validations.

### Animation Strategy
- Framer Motion for all page transitions and component animations
- canvas-confetti for celebrations (correct answers, vault unlock, reveal)
- Animations use path-specific colors from `PATH_METADATA`
- Shake animations for incorrect answers


Respond with minimal prose. Provide only the code changes and a brief 1-sentence explanation of why the change was made.