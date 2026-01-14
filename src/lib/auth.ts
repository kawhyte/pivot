import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface AgentProfile {
  id: number;
  name: string;
  isTester: boolean;
}

export async function verifyPasscode(code: string): Promise<AgentProfile | null> {
  if (!db) {
    console.error('Database connection not available');
    return null;
  }

  try {
    const normalizedCode = code.trim().toUpperCase();

    const result = await db
      .select({
        id: profiles.id,
        name: profiles.agentName,
        isTester: profiles.isTester,
      })
      .from(profiles)
      .where(eq(profiles.secretCode, normalizedCode))
      .limit(1);

    if (result.length === 0) {
      console.warn(`Auth failed: Code ${normalizedCode} not found in Database.`);
      return null;
    }

    return result[0];
  } catch (error) {
    // If you see an error here now, it's likely a connection string issue
    console.error('Error verifying passcode:', error);
    return null;
  }
}