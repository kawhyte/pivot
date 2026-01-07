# 📱💻 Cross-Device Progress Sync Guide

## Overview

The Birthday Quest now supports **cross-device progress syncing** via shareable links. Your wife can start the quest on her phone Monday, continue on her laptop Tuesday, and pick up right where she left off!

---

## How It Works

### Data Storage

**Database-First Architecture**:
- ✅ **Supabase Database** = Source of truth (all progress saved here)
- ✅ **localStorage** = Only stores `userId` (for session continuity)
- ✅ **Zustand** = In-memory state (for UI, not persisted)

### Progress Flow

```
Device A (Phone):
1. Opens app → Creates userId=123 in database
2. Completes Pop Culture path → Saved to database
3. Clicks "Share Progress" → Copies link: https://yourapp.com?userId=123

Device B (Desktop):
1. Opens shared link: https://yourapp.com?userId=123
2. App reads userId from URL → Fetches progress from database
3. Shows 1/3 keys collected (Pop Culture complete)
4. Continues quest seamlessly!
```

---

## Using the Share Progress Feature

### Step 1: Share Your Progress

On any device with progress:
1. Scroll to bottom of Vault Hub
2. Click **"Share Progress"** button (purple, next to "How to Play")
3. Link copied to clipboard automatically!

**Generated link format**:
```
https://your-app-url.com?userId=123
```

### Step 2: Continue on Another Device

On new device:
1. Paste the shared link in browser
2. Open the link
3. Progress automatically syncs from database
4. Continue where you left off!

---

## Example Scenarios

### Scenario 1: Phone → Desktop
```
Monday (Phone):
✅ Completes Pop Culture path
✅ Clicks "Share Progress"
✅ Sends link to self via email/text

Tuesday (Desktop):
✅ Opens link from email
✅ Sees Pop Culture key already collected
✅ Unlocks Renaissance path
✅ Continues quest
```

### Scenario 2: Work Laptop → Home Laptop
```
Lunchbreak (Work):
✅ Starts Heart path (completes 2/5 puzzles)
✅ Clicks "Share Progress"
✅ Bookmarks link

Evening (Home):
✅ Opens bookmarked link
✅ Resumes Heart path at puzzle 3/5
```

### Scenario 3: Lost Phone
```
Before:
✅ Completes 2/3 paths on phone
✅ Shares progress link (stored in email)

After (New Phone):
✅ Opens link from email
✅ All progress restored!
✅ Only final path remains
```

---

## Technical Details

### URL Parameter Handling

**Priority Order**:
1. **URL Parameter** (`?userId=123`) - Highest priority
2. **localStorage** (`userId` from previous session)
3. **New User** (creates account if neither exists)

**Automatic URL Cleanup**:
- After reading `userId` from URL, the parameter is removed
- User sees clean URL: `https://yourapp.com`
- `userId` stored in localStorage for future visits

### How It's Implemented

**`components/QuestHydration.tsx`**:
```typescript
const urlUserId = searchParams.get('userId');

if (urlUserId) {
  // Shared link opened - use that userId
  activeUserId = parseInt(urlUserId, 10);
  setUserId(activeUserId);

  // Clean URL
  window.history.replaceState({}, '', '/');
} else if (userId) {
  // Existing session
  activeUserId = userId;
} else {
  // New user
  activeUserId = await createUser();
}

// Always fetch from database
const completedPaths = await fetchUserProgress(activeUserId);
hydrateFromDatabase(completedPaths);
```

**`app/page.tsx`** (Share Button):
```typescript
const handleShareProgress = async () => {
  const shareUrl = `${window.location.origin}?userId=${userId}`;
  await navigator.clipboard.writeText(shareUrl);
  setLinkCopied(true);
};
```

---

## Testing Cross-Device Sync

### Test 1: Same Device, Incognito Mode

1. **Normal Browser**:
   - Complete Pop Culture path
   - Click "Share Progress"
   - Copy link

2. **Incognito Window**:
   - Paste link
   - Should see Pop Culture key already collected

### Test 2: Different Browsers

1. **Chrome**:
   - Complete Renaissance path
   - Click "Share Progress"

2. **Safari**:
   - Open shared link
   - Should see Renaissance key collected

### Test 3: Mobile → Desktop

1. **iPhone/Android**:
   - Complete Heart path
   - Click "Share Progress"
   - Send link via text/email

2. **Desktop**:
   - Open link from text/email
   - Should see Heart key collected

---

## User Instructions (For Your Wife)

When you give her the initial link, include these instructions:

> **💡 Pro Tip**: You can continue this quest on any device!
>
> Just click the **"Share Progress"** button at the bottom of the screen and open that link on your other devices (phone, laptop, tablet).
>
> Your progress is saved in the cloud, so you'll always pick up right where you left off! 🎉

---

## Admin Dashboard & Cross-Device

**Admin Dashboard** (`/admin`) shows:
- One user per unique `userId`
- All progress tracked in database
- If she uses shared link → sees same user's progress
- If she creates new user → sees separate entry

**Example**:
```
Admin Dashboard:
┌─────────┬────────────┬─────────────┬───────┬──────────┐
│ User ID │ Pop Culture│ Renaissance │ Heart │ Progress │
├─────────┼────────────┼─────────────┼───────┼──────────┤
│ #123    │ ✅ Complete│ ⏳ Level 3/5│ 🔒    │ 1/3      │
└─────────┴────────────┴─────────────┴───────┴──────────┘

This is the same user across ALL devices (shared link used)
```

---

## What If She Doesn't Share?

If she never clicks "Share Progress" and opens the app on a different device:
- ✅ New `userId` created
- ✅ Starts quest from beginning
- ✅ Admin dashboard shows 2 separate users

**Not a problem!** She can still complete the quest. Admin will just show multiple user entries.

---

## Security Notes

**Is the URL secure?**
- ✅ `userId` is a simple integer (not sensitive data)
- ✅ No passwords or personal info in URL
- ✅ Anyone with the link can see progress (but it's just a birthday gift)

**For production** (if needed):
- Could generate random secret codes instead of sequential IDs
- Could add password protection
- Could expire links after X days

Current implementation: **Simple & user-friendly** (perfect for birthday gift)

---

## localStorage vs Database Summary

| Feature | localStorage | Database |
|---------|-------------|----------|
| **What's stored** | `userId` only | All progress |
| **Survives refresh** | ✅ Yes | ✅ Yes |
| **Survives browser clear** | ❌ No | ✅ Yes |
| **Cross-device sync** | ❌ No | ✅ Yes (via shared link) |
| **Admin dashboard** | ❌ Can't access | ✅ Yes |
| **Offline support** | ✅ Yes | ❌ Needs internet |

---

## Troubleshooting

### Issue: "Share Progress button doesn't work"
**Cause**: `userId` not loaded yet
**Solution**: Wait 1-2 seconds after page load, then click

### Issue: "Shared link doesn't show my progress"
**Possible causes**:
1. Progress not synced to database yet (wait a few seconds after completing path)
2. Wrong `userId` in URL (check the number matches)
3. Database connection issue (check admin dashboard shows progress)

**Solution**: Try refreshing original device, click "Share Progress" again

### Issue: "Link shows someone else's progress"
**Cause**: Copied wrong link
**Solution**: Generate new link on device with correct progress

---

## Reset After Testing

To reset and test cross-device flow again:

```bash
# Reset database
npm run reset:db

# Clear localStorage on all devices manually:
# Open DevTools → Console → Run:
localStorage.clear()
location.reload()
```

---

Made with 💝 for seamless cross-device birthday quest adventures!
