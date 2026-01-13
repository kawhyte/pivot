/**
 * Agent Profile
 */
export interface AgentProfile {
  id: number;
  name: string;
  role: string;
}

/**
 * Valid agent passcodes and their profiles
 */
const AGENT_CREDENTIALS: Record<string, AgentProfile> = {
  'MOONLIGHT-747': {
    id: 1,
    name: 'AGENT VIOLET',
    role: 'Master Keyholder',
  },
  'NEBULA-X-RAY': {
    id: 2,
    name: 'SPECTRE 01',
    role: 'Tester',
  },
  'ORION-SHADOW': {
    id: 3,
    name: 'GHOST PROTOCOL',
    role: 'Tester',
  },
};

/**
 * Verify passcode and return agent profile
 * Returns null if passcode is invalid
 */
export async function verifyPasscode(code: string): Promise<AgentProfile | null> {
  // Normalize input: uppercase and trim
  const normalizedCode = code.trim().toUpperCase();

  // Check against valid credentials
  const profile = AGENT_CREDENTIALS[normalizedCode];

  if (!profile) {
    return null;
  }

  return profile;
}
