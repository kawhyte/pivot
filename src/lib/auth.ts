import { supabase } from '@/db';

export interface AgentProfile {
  id: number;
  name: string;
  isTester: boolean;
}

export async function verifyPasscode(code: string): Promise<AgentProfile | null> {
  const normalizedCode = code.trim().toUpperCase();

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, agent_name, is_tester')
      .eq('secret_code', normalizedCode)
      .single();

    if (error || !data) {
      console.warn(`AUTH: Code "${normalizedCode}" not found.`);
      return null;
    }

    return {
      id: data.id,
      name: data.agent_name,
      isTester: data.is_tester
    };
  } catch (err) {
    console.error('CRITICAL: Supabase Auth Failure', err);
    return null;
  }
}