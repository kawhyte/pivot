import { supabase } from '@/db';

export async function verifyPasscode(code: string) {
  const normalizedCode = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, agent_name, is_tester')
    .eq('secret_code', normalizedCode)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.agent_name,
    isTester: data.is_tester
  };
}