# 🔄 Progress Reset Guide

## Where is Progress Saved?

### 1. **Client-Side (Browser LocalStorage)**
- **Key**: `birthday-quest-storage`
- **Contains**: Only `userId: 123` (for session continuity)
- **Note**: All quest progress (keys, levels, etc.) is stored in database, NOT localStorage

**Check localStorage**:
```javascript
// View current state (only shows userId)
localStorage.getItem('birthday-quest-storage')
// Example: {"state":{"userId":123},"version":0}
```

### 2. **Database (Supabase)**

**Tables**:
- `users` - User accounts
  - `id`, `secretCode`, `createdAt`

- `quest_progress` - Quest completion tracking
  - `userId`, `pathId`, `isCompleted`, `currentLevel`
  - `completedAt`, `updatedAt`

**View database**:
```bash
npm run db:studio
```

---

## Reset Methods

### **Option 1: Quick Client-Side Reset** (Browser Only)

**Best for**: Testing without affecting database

**Browser Console** (F12 or Cmd+Option+I):
```javascript
// Remove quest state
localStorage.removeItem('birthday-quest-storage');

// Reload page
location.reload();
```

Or use Chrome settings:
1. Open `chrome://settings/siteData`
2. Search: `localhost:3000`
3. Click trash icon → Delete

### **Option 2: Database Reset** (Server Only)

**Best for**: Clearing all user records

```bash
npm run reset:db
```

**What happens**:
- ✅ Deletes all users from database
- ✅ Deletes all quest_progress records
- ⚠️ Users still have progress in localStorage
- 📝 Next visit creates new user

### **Option 3: Complete Reset** (Both)

**Best for**: Fresh start for testing full flow

```bash
npm run reset:all
```

**What happens**:
- ✅ Clears database
- ✅ Shows instructions for clearing localStorage
- 📝 Next page load creates brand new user

---

## Reset for Testing Scenarios

### **Scenario 1: Test First-Time User Experience**
```bash
# Clear everything
npm run reset:all

# Then in browser console:
localStorage.clear()
location.reload()
```

**Result**: Welcome screen shows → new user created → empty vault

### **Scenario 2: Test Path Completion Flow**
```bash
# Keep database, clear client
npm run reset:client
```

**Result**: User sees their database progress restored on reload

### **Scenario 3: Test Multiple Users in Admin Dashboard**
```bash
# Clear localStorage only (multiple times with different browsers/incognito)
# Each browser creates a new user in database
```

**Result**: Admin dashboard shows multiple users

### **Scenario 4: Reset Between Gift Recipients**
```bash
# Complete reset
npm run reset:all

# Manually clear localStorage in browser
```

**Result**: Clean slate for next person

---

## Manual Database Reset (SQL)

If you prefer SQL directly in Drizzle Studio:

```sql
-- Delete all progress
DELETE FROM quest_progress;

-- Delete all users
DELETE FROM users;

-- Reset auto-increment (optional)
ALTER SEQUENCE quest_progress_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
```

---

## Verify Reset Success

### Check Client-Side:
```javascript
// Should return null
localStorage.getItem('birthday-quest-storage')
```

### Check Database:
```bash
npm run db:studio
```

Then query:
```sql
SELECT COUNT(*) FROM users;         -- Should be 0
SELECT COUNT(*) FROM quest_progress; -- Should be 0
```

### Check App State:
1. Open `http://localhost:3000`
2. Should see Welcome screen
3. Check admin: `http://localhost:3000/admin`
4. Should show "No users yet"

---

## What Happens After Reset?

### First Visit After Reset:
1. ✅ Welcome screen shows (no `hasSeenIntro` in localStorage)
2. ✅ Click "Begin the Adventure"
3. ✅ `QuestHydration` component runs
4. ✅ No `userId` found → calls `createUser()`
5. ✅ New user created in database
6. ✅ `userId` saved to Zustand → persisted to localStorage
7. ✅ Empty vault shown (0/3 keys)

### Admin Dashboard After Reset:
- Total Users: 0 → changes to 1 after first visit
- Keys Collected: 0/0
- Vault Status: 🔒 Locked
- No activity in timeline

---

## Troubleshooting

### Issue: "Can't clear localStorage"
**Solution**: Make sure you're on the correct origin (`http://localhost:3000`)
```javascript
// Check current origin
window.location.origin

// Force clear all
for (let key in localStorage) {
  localStorage.removeItem(key);
}
```

### Issue: "Database reset fails"
**Solution**: Check database connection
```bash
# Test connection
npm run db:studio

# Check .env.local has DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### Issue: "Progress reappears after refresh"
**Cause**: localStorage not cleared OR database still has records
**Solution**: Run complete reset:
```bash
npm run reset:all

# Then manually clear in browser:
localStorage.clear()
location.reload()
```

---

## Testing Checklist After Reset

- [ ] Visit `http://localhost:3000` → See Welcome screen
- [ ] Click "Begin the Adventure" → See empty Vault (0/3 keys)
- [ ] Check browser console → No errors
- [ ] Check localStorage → Has `birthday-quest-storage` with new `userId`
- [ ] Visit `/admin` → Shows 1 user, 0 keys collected
- [ ] Complete a path → Admin shows 1 key collected
- [ ] Refresh browser → Progress persists

---

## Important Notes

1. **Production Reset**: Be VERY careful! Resetting production database deletes real user progress.

2. **localStorage is per-origin**: `localhost:3000` and `myapp.vercel.app` have separate localStorage.

3. **Database persists across deploys**: Resetting locally doesn't affect production database.

4. **Incognito mode**: Always starts fresh (no localStorage), but still creates database user.

5. **Admin dashboard**: Not affected by localStorage, only shows database state.

6. **Cross-Device Sync**: See [`CROSS_DEVICE_SYNC.md`](./CROSS_DEVICE_SYNC.md) for using the "Share Progress" feature across multiple devices.

---

Made with 💝 for stress-free testing!
