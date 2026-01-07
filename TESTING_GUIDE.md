# 🧪 Birthday Quest Testing Guide

Complete guide for testing all features of the Birthday Quest app.

## 🚀 Quick Start

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start dev server**:
   ```bash
   npm run dev
   ```

3. **Open** http://localhost:3000

---

## 📅 Testing Daily Unlock System

The app unlocks paths based on the `START_DATE` in `lib/daily-drop.ts`.

### Current Test Configuration
- **START_DATE**: `2026-01-05` (All 3 paths unlocked for testing)

### Daily Drop Schedule
- **Day 1 (Jan 7)**: Pop Culture unlocks
- **Day 2 (Jan 8)**: Renaissance unlocks
- **Day 3 (Jan 9)**: Heart unlocks

### Testing Different Scenarios

**Scenario 1: All Paths Unlocked** (Current)
```typescript
export const START_DATE = new Date('2026-01-05T00:00:00');
```

**Scenario 2: Only Pop Culture Unlocked**
```typescript
export const START_DATE = new Date('2026-01-07T00:00:00');
```

**Scenario 3: Pop Culture + Renaissance Unlocked**
```typescript
export const START_DATE = new Date('2026-01-06T00:00:00');
```

**Scenario 4: All Paths Locked (Pre-Birthday)**
```typescript
export const START_DATE = new Date('2026-01-08T00:00:00');
```

---

## 🎮 Testing Quest Paths

### Path 1: Pop Culture (Friends & Gilmore Girls)

**Test Answers:**
1. Ross's monkey? → **Marcel** (multiple choice)
2. Coffee shop? → **Central Perk** (text input)
3. Lorelai & Rory's inn? → **The Independence Inn** (multiple choice)
4. Town name? → **Stars Hollow** (text input)
5. Monica & Chandler's twins? → **Jack and Erica** (multiple choice)

**What to Test:**
- [ ] Path shows "Start Quest" button when unlocked
- [ ] Clicking path navigates to `/quest/1`
- [ ] Progress bar shows 1/5, 2/5, etc.
- [ ] Correct answers trigger confetti
- [ ] Wrong answers show hint after attempt
- [ ] Success message displays after correct answer
- [ ] Automatically advances to next puzzle
- [ ] Completion screen shows after puzzle 5
- [ ] Key is added to collection
- [ ] Returns to vault with key collected

---

### Path 2: Renaissance (General Knowledge)

**Test Answers:**
1. Mona Lisa painter? → **Leonardo da Vinci** (multiple choice)
2. Smallest planet? → **Mercury** (text input)
3. Theory of relativity? → **Albert Einstein** (multiple choice)
4. Largest ocean? → **Pacific Ocean** (text input)
5. Romeo & Juliet author? → **William Shakespeare** (multiple choice)

**What to Test:**
- [ ] Same testing checklist as Pop Culture path
- [ ] Deep Emerald & Gold theme displays correctly

---

### Path 3: Heart (Personal Memories)

**Test Answers (Placeholders):**
1. First date location? → **The Coffee House** (text input)
2. First dance song? → **At Last by Etta James** (multiple choice)
3. Special nickname? → **Sweetheart** (text input)
4. Engagement month? → **December** (multiple choice)
5. Special place? → **The Beach** (text input)

**What to Test:**
- [ ] Same testing checklist as other paths
- [ ] Soft Crimson & Rose theme displays correctly
- [ ] Replace with real answers before launch!

---

## 🏆 Testing Vault Unlock Sequence

### Prerequisites
Complete all 3 paths to collect all 3 keys.

### Fast Testing Method
1. Complete Pop Culture path (collect Key #1)
2. Return to vault - see 1/3 progress
3. Complete Renaissance path (collect Key #2)
4. Return to vault - see 2/3 progress
5. Complete Heart path (collect Key #3)
6. **Watch for confetti celebration on vault page!**

### What Happens When All Keys Collected

**On Vault Page:**
- [ ] Green confetti fires automatically
- [ ] Progress shows 3/3
- [ ] "Vault Unlocked!" card appears
- [ ] "Open Vault" button is visible and clickable

**Clicking "Open Vault":**
- [ ] Navigates to `/vault`
- [ ] **Stage 1 (1.5s)**: "Unlocking the Vault..." with rotating gift icon
- [ ] **Stage 2 (2.5s)**: "The Vault Opens!" with spinning sparkles + confetti burst
- [ ] **Stage 3 (2s)**: "Your Birthday Surprise..." with pulsing heart
- [ ] **Stage 4**: Final "Happy Birthday!" message with all details
- [ ] Confetti continues throughout stages 2-4
- [ ] "Reveal My Gift" button appears

**Clicking "Reveal My Gift":**
- [ ] Returns to vault (placeholder - customize with your final gift reveal!)

---

## 🐛 Common Issues & Solutions

### Issue: Puzzles not loading
**Solution:** Check browser console for errors. Verify puzzle data in `/data/puzzles/`

### Issue: Vault not unlocking after 3 keys
**Solution:** Check Zustand store in browser DevTools (Application → Local Storage → `birthday-quest-storage`)

### Issue: Dates showing wrong unlock times
**Solution:** Verify `START_DATE` in `lib/daily-drop.ts` and refresh page

### Issue: Confetti not showing
**Solution:** Check that `canvas-confetti` is installed: `npm install canvas-confetti`

### Issue: Navigation not working
**Solution:** Clear browser cache and localStorage, then refresh

---

## 🎨 Visual Testing Checklist

### Mobile Responsive (Primary Target)
- [ ] Test on actual iPhone/Android device
- [ ] Test in Chrome DevTools mobile simulator
- [ ] All text is readable
- [ ] Buttons are easily tappable (44px+ touch targets)
- [ ] No horizontal scrolling
- [ ] Animations are smooth

### Tablet & Desktop
- [ ] Content stays centered and max-width constrained
- [ ] No layout breaking
- [ ] Still looks good (even though mobile-first)

### Dark Mode
- [ ] Not currently implemented (app uses light theme)
- [ ] Consider adding for bonus points!

---

## 📊 State Persistence Testing

The app uses Zustand with localStorage for persistence.

### What Gets Saved:
- Keys collected (which paths completed)
- Current level in each path
- Vault unlock status
- Active path

### Testing Persistence:
1. Complete a path halfway (e.g., puzzle 3/5)
2. Refresh the browser
3. Return to that path
4. **Expected:** Should resume from puzzle 3

### Resetting State:
Open browser DevTools → Console → Run:
```javascript
localStorage.clear()
location.reload()
```

---

## 🚢 Pre-Launch Checklist

Before showing this to your wife:

### Content
- [ ] Customize Heart path with real memories (`data/puzzles/heart.ts`)
- [ ] Review all success messages for typos
- [ ] Test all answers work (including variations)
- [ ] Replace "TODO" comments with actual content

### Configuration
- [ ] Set `START_DATE` to her actual birthday: `2026-01-20T00:00:00`
- [ ] Update metadata in `app/layout.tsx` if needed
- [ ] Add actual photos for image-reveal puzzles (if using)

### Technical
- [ ] Test on her actual device (phone model/browser)
- [ ] Verify all 3 paths work end-to-end
- [ ] Test vault unlock sequence completely
- [ ] Check loading states and error handling
- [ ] Test with slow network (DevTools → Network → Slow 3G)

### Final Reveal
- [ ] Customize "Reveal My Gift" button destination
- [ ] Add actual gift details/message
- [ ] Consider adding photo slideshow or video
- [ ] Maybe connect to real surprise (restaurant reservation, tickets, etc.)

---

## 🎯 Success Criteria

The app is ready when:
- ✅ All 15 puzzles work perfectly
- ✅ Daily unlock system functions correctly
- ✅ Vault unlock sequence is magical and bug-free
- ✅ Heart path has real, meaningful memories
- ✅ Tested on her actual phone
- ✅ You've added your personal touch to the final reveal
- ✅ No console errors

---

Made with love for a special birthday! 💝
