#!/usr/bin/env node

/**
 * Reset Quest Progress Script
 *
 * This script provides multiple options to reset quest progress:
 * 1. Clear localStorage only (client-side reset)
 * 2. Clear database only (server-side reset)
 * 3. Clear both (complete reset)
 *
 * Usage:
 *   npm run reset:client     # Clear localStorage only
 *   npm run reset:db         # Clear database only
 *   npm run reset:all        # Clear both
 */

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users, questProgress } = require('../db/schema');
const { sql } = require('drizzle-orm');
require('dotenv').config({ path: '.env.local' });

const mode = process.argv[2] || 'all';

async function resetDatabase() {
  console.log('🗄️  Connecting to database...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  try {
    console.log('🧹 Deleting all quest progress...');
    await db.execute(sql`DELETE FROM quest_progress`);

    console.log('🧹 Deleting all users...');
    await db.execute(sql`DELETE FROM users`);

    console.log('✅ Database reset complete!');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

function resetClient() {
  console.log('\n📱 To reset client-side progress:');
  console.log('   1. Open browser DevTools (F12 or Cmd+Option+I)');
  console.log('   2. Go to Console tab');
  console.log('   3. Run: localStorage.removeItem("birthday-quest-storage")');
  console.log('   4. Run: location.reload()');
  console.log('\n   OR visit: chrome://settings/siteData (search for localhost:3000 and delete)');
}

async function main() {
  console.log('🎯 Quest Progress Reset Tool\n');

  if (mode === 'client') {
    resetClient();
  } else if (mode === 'db') {
    await resetDatabase();
    console.log('\n⚠️  Note: Users still have progress in localStorage');
    console.log('   They will create a new user on next visit.');
  } else if (mode === 'all') {
    await resetDatabase();
    resetClient();
    console.log('\n✅ Complete reset! Fresh start on next visit.');
  } else {
    console.log('Usage: npm run reset:[client|db|all]');
    console.log('  client - Clear browser localStorage only');
    console.log('  db     - Clear database only');
    console.log('  all    - Clear both (default)');
  }
}

main();
