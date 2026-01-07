# 🔐 Admin Dashboard & Persistence Guide

## Overview

The Birthday Quest app now features:
1. **Optimistic Persistence**: All progress automatically syncs to Supabase database
2. **Secret Admin Dashboard**: Real-time monitoring at `/admin`
3. **Cross-device Support**: Progress persists across browsers and devices

---

## 🎯 How It Works

### User Flow

1. **First Visit**:
   - App creates a unique user in database
   - User ID stored in localStorage
   - Progress tracked both locally and in database

2. **Completing a Path**:
   ```
   User solves final puzzle
     ↓
   [INSTANT] Zustand updates local state
     → Confetti fires
     → UI updates immediately
     → Navigation happens
     ↓
   [BACKGROUND] Server action syncs to database
     → `syncPathCompletion(userId, pathId)` called
     → Database updated asynchronously
     → Admin dashboard reflects change
   ```

3. **Returning Visit**:
   - App reads userId from localStorage
   - Fetches progress from database
   - Merges with local state (database = source of truth)
   - User sees their saved progress

### Database Schema

**`users` table**:
- `id`: Auto-incrementing primary key
- `secretCode`: Unique identifier (auto-generated)
- `createdAt`: Account creation timestamp

**`quest_progress` table**:
- `id`: Auto-incrementing primary key
- `userId`: Foreign key to users
- `pathId`: 1 (Pop Culture), 2 (Renaissance), or 3 (Heart)
- `isCompleted`: Boolean completion status
- `currentLevel`: Current puzzle (1-5)
- `completedAt`: Timestamp when path was completed
- `updatedAt`: Last activity timestamp
- **Unique constraint**: (userId, pathId) - prevents duplicates

---

## 🎛️ Admin Dashboard

### Accessing the Dashboard

**URL**: `http://localhost:3000/admin` (or your production URL + `/admin`)

**Security**:
- No links from main UI (type URL manually)
- No password required (add later if needed)
- Only visible to Kenny (URL not shared with users)

### Dashboard Features

#### 1. **Overview Stats**
- Total Users
- Keys Collected (X / 3 per user)
- Vault Status (🔒 Locked or 🎉 Unlocked)

#### 2. **User Progress Table**
Shows detailed progress for each user:
- User ID and creation time
- Status of each path:
  - ✅ **Complete** with timestamp
  - ⏳ **In Progress** with current level (X/5)
  - 🔒 **Locked** (not started)
- Overall progress bar (0/3, 1/3, 2/3, 3/3)

#### 3. **Activity Timeline**
- Chronological feed of all completed paths
- Most recent activity first
- Shows: path icon, path name, user ID, time ago

### Real-time Updates

The admin page uses:
- `export const dynamic = 'force-dynamic'` - No static caching
- `export const revalidate = 0` - Always fetch fresh data
- Server-side rendering - Always shows latest database state

**Refresh**: Simply reload the page to see latest progress

---

## 🧪 Testing the System

### Test 1: Complete a Path and Verify Sync

1. Open main app: `http://localhost:3000`
2. Complete a full path (5 puzzles)
3. Watch confetti fire (instant feedback)
4. Open admin dashboard: `http://localhost:3000/admin`
5. **Expected**: See path marked as ✅ Complete with timestamp

### Test 2: Cross-device Persistence

1. Complete a path on Device A (or Browser A)
2. Note the userId in browser localStorage:
   ```javascript
   localStorage.getItem('birthday-quest-storage')
   ```
3. Clear localStorage on Device A
4. Refresh page
5. **Expected**: User should see empty progress (new user created)
6. Check admin dashboard
7. **Expected**: See TWO users now

**Note**: True cross-device sync requires sharing userId via URL parameter or login system (not implemented yet)

### Test 3: Progress Resumption

1. Complete 2 puzzles in Pop Culture path
2. Close browser completely
3. Reopen app
4. Navigate to Pop Culture path
5. **Expected**: Resume from puzzle 3

### Test 4: Database Sync Failure Handling

1. Stop database (disconnect internet or kill Supabase)
2. Complete a path
3. **Expected**:
   - UI still updates instantly (optimistic)
   - Confetti still fires
   - Console shows error (doesn't block UI)
4. Reconnect database
5. Complete another path
6. **Expected**: New completion syncs successfully

---

## 🔧 Server Actions Reference

### `createUser()`
Creates a new user with auto-generated secret code.

**Returns**: `userId` (number)

**Called**: Automatically on first app load

### `syncPathCompletion(userId, pathId)`
Marks a path as completed in the database.

**Parameters**:
- `userId`: number
- `pathId`: 1, 2, or 3

**Called**: Automatically when user completes a path

**Behavior**: Upserts (insert or update) - safe to call multiple times

### `syncPathLevel(userId, pathId, level)`
Updates current puzzle progress for a path.

**Parameters**:
- `userId`: number
- `pathId`: 1, 2, or 3
- `level`: 1-5

**Called**: Automatically after each puzzle completion

### `fetchUserProgress(userId)`
Retrieves all completed paths for a user.

**Returns**: `number[]` (array of completed path IDs)

**Called**: Automatically on app mount (hydration)

### `fetchAllProgress()`
Gets all users and their progress (admin only).

**Returns**: Array of `{ user, progress }` objects

**Called**: By admin dashboard on page load

---

## 🚨 Troubleshooting

### Issue: Progress not syncing to database

**Check**:
1. Is `DATABASE_URL` set in `.env.local`?
2. Is database accessible? Test with: `npm run db:studio`
3. Check browser console for errors
4. Check dev server logs for database errors

**Fix**: Ensure Supabase connection string is correct

### Issue: Admin dashboard shows no users

**Check**:
1. Has anyone visited the main app yet?
2. Check database directly: `npm run db:studio`
3. Look at `users` table

**Fix**: Visit main app first to create a user

### Issue: User ID not persisting

**Check**:
1. Is localStorage enabled in browser?
2. Check: `localStorage.getItem('birthday-quest-storage')`

**Fix**: Clear cache and localStorage, refresh page

### Issue: Duplicate progress entries

**Should not happen** - unique constraint on (userId, pathId)

**If it does**:
1. Check database schema has unique index
2. Run: `npm run db:push` to update schema

---

## 📊 Database Queries (for Kenny)

### View all users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### View all progress
```sql
SELECT
  u.id as user_id,
  u.secret_code,
  qp.path_id,
  qp.is_completed,
  qp.current_level,
  qp.completed_at
FROM users u
LEFT JOIN quest_progress qp ON u.id = qp.user_id
ORDER BY u.created_at DESC, qp.path_id;
```

### Check vault unlock status (all 3 keys)
```sql
SELECT
  u.id,
  COUNT(CASE WHEN qp.is_completed THEN 1 END) as keys_collected
FROM users u
LEFT JOIN quest_progress qp ON u.id = qp.user_id
GROUP BY u.id
HAVING COUNT(CASE WHEN qp.is_completed THEN 1 END) = 3;
```

### Recent activity
```sql
SELECT
  u.id as user_id,
  qp.path_id,
  qp.completed_at
FROM users u
JOIN quest_progress qp ON u.id = qp.user_id
WHERE qp.completed_at IS NOT NULL
ORDER BY qp.completed_at DESC
LIMIT 10;
```

---

## 🎁 Before Launch Checklist

- [ ] Test complete user flow (first visit → complete 3 paths → vault unlock)
- [ ] Verify admin dashboard shows correct data
- [ ] Test progress persistence (refresh browser)
- [ ] Check database has data: `npm run db:studio`
- [ ] Test on her actual device (phone)
- [ ] Verify START_DATE is set to her birthday: `2026-01-20T00:00:00`
- [ ] Bookmark admin URL for monitoring: `https://your-domain.com/admin`
- [ ] Test that database syncs work in production (not just localhost)

---

## 🔮 Future Enhancements

### 1. Add Password Protection to Admin
```typescript
// app/admin/page.tsx
const searchParams = await params.searchParams;
const password = searchParams.password;

if (password !== 'your-secret-password') {
  return <div>Access Denied</div>;
}
```

### 2. Live Updates (WebSocket/Polling)
```typescript
// Add polling to admin dashboard
useEffect(() => {
  const interval = setInterval(() => {
    router.refresh(); // Refetch data
  }, 5000); // Every 5 seconds
  return () => clearInterval(interval);
}, []);
```

### 3. Export Progress as JSON
```typescript
export async function exportProgress() {
  const data = await fetchAllProgress();
  return JSON.stringify(data, null, 2);
}
```

### 4. Send Push Notification on Key Collection
```typescript
// After syncPathCompletion
await sendPushNotification({
  title: 'Key Collected!',
  body: `User #${userId} completed ${pathNames[pathId]}`,
});
```

---

Made with 💝 for tracking her birthday quest journey!
