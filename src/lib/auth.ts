import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Agent Profile returned from database
 */
export interface AgentProfile {
  id: number;
  name: string;
  role: string;
  isTester: boolean;
}

/**
 * Verify passcode against database profiles table
 * Returns profile with isTester flag if valid, null if invalid
 */
export async function verifyPasscode(code: string): Promise<AgentProfile | null> {
  if (!db) {
    console.error('Database connection not available');
    return null;
  }

  try {
    // Normalize input: uppercase and trim
    const normalizedCode = code.trim().toUpperCase();

    // Query profiles table for matching secret code
    const result = await db
      .select({
        id: profiles.id,
        name: profiles.agentName,
        role: profiles.agentRole,
        isTester: profiles.isTester,
      })
      .from(profiles)
      .where(eq(profiles.secretCode, normalizedCode))
      .limit(1);

    // Return profile if found, null otherwise
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error verifying passcode:', error);
    return null;
  }
}
