import { supabase } from '@/db';
import type { PathId } from '@/lib/paths';

/**
 * Fetch or create active session for a path
 */
export async function getOrCreateSession(profileId: number, pathId: PathId) {
  if (!supabase) return null;

  try {
    // Try to fetch existing session
    const { data: existing, error: fetchError } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('active_path_id', pathId)
      .single();

    if (existing && !fetchError) {
      return existing;
    }

    // Create new session
    const { data: newSession, error: insertError } = await supabase
      .from('active_sessions')
      .insert({
        profile_id: profileId,
        active_path_id: pathId,
        current_puzzle_id: null,
        shuffled_queue: null,
        attempts_made: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating session:', insertError);
      return null;
    }

    return newSession;
  } catch (error) {
    console.error('Error getting/creating session:', error);
    return null;
  }
}

/**
 * Update active session with current progress
 * Uses upsert for atomic updates
 */
export async function syncSessionProgress(
  profileId: number,
  pathId: PathId,
  updates: {
    currentPuzzleId?: string | null;
    shuffledQueue?: string[];
    attemptsMade?: number;
    score?: number;
    mistakes?: number;
  }
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('active_sessions')
      .upsert({
        profile_id: profileId,
        active_path_id: pathId,
        current_puzzle_id: updates.currentPuzzleId,
        shuffled_queue: updates.shuffledQueue,
        attempts_made: updates.attemptsMade,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'profile_id',
      });

    if (error) {
      console.error('Error syncing session progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error syncing session progress:', error);
    return false;
  }
}

/**
 * Fetch quest progress (completed paths) for a profile
 */
export async function fetchQuestProgress(profileId: number) {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('quest_progress')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching quest progress:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching quest progress:', error);
    return [];
  }
}

/**
 * Save completed path to quest_progress table
 */
export async function savePathCompletion(
  profileId: number,
  pathId: PathId,
  data: {
    completedIds: string[];
    skippedIds: string[];
    finalScore: number;
    accuracy: number;
    mistakes: number;
    themedTitle: string;
  }
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('quest_progress')
      .upsert({
        profile_id: profileId,
        path_id: pathId,
        is_completed: true,
        score: data.finalScore,
        completed_at: new Date().toISOString(),
        mistakes: data.mistakes,
        themed_title: data.themedTitle,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'profile_id,path_id',
      });

    if (error) {
      console.error('Error saving path completion:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving path completion:', error);
    return false;
  }
}

/**
 * Fetch profile with isTester flag
 */
export async function fetchProfile(profileId: number) {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data ? {
      id: data.id,
      agentName: data.agent_name,
      agentRole: data.agent_role || 'Agent',
      isTester: data.is_tester || false,
    } : null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}
