import { supabase } from '@/db';

export const VALID_CODES = ['BIRTHDAY2026', 'KENNY2026', 'TEST2026'];

/**
 * Agent Profile type returned from authentication
 */
export interface AgentProfile {
  id: number;
  name: string;
  role: string;
  isTester: boolean;
}

/**
 * Verify passcode against Supabase database
 */
export async function verifyPasscode(code: string): Promise<AgentProfile | null> {
  const upperCode = code.toUpperCase().trim();

  console.log('AUTH: Verifying code:', upperCode);

  // Check if code is in allowed list
  if (!VALID_CODES.includes(upperCode)) {
    console.log('AUTH: Code not in valid list');
    return null;
  }

  // Check Supabase connection
  if (!supabase) {
    console.error('AUTH: Supabase not initialized');
    return null;
  }

  try {
    // Query Supabase for this code
    const { data, error } = await supabase
      .from('profiles')
      .select('id, agent_name, is_tester')
      .eq('secret_code', upperCode)
      .single();

    if (error) {
      console.error('AUTH: Database error:', error);
      return null;
    }

    if (!data) {
      console.log('AUTH: Code not found in database');
      return null;
    }

    console.log('AUTH: User found:', data);

    // Return in AgentProfile format
    return {
      id: data.id,
      name: data.agent_name,
      role: data.is_tester ? 'Tester' : 'Agent',
      isTester: data.is_tester,
    };
  } catch (err) {
    console.error('AUTH: Error during verification:', err);
    return null;
  }
}