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
      .eq('path_id', pathId)
      .single();

    if (existing && !fetchError) {
      return existing;
    }

    // Create new session
    const { data: newSession, error: insertError } = await supabase
      .from('active_sessions')
      .insert({
        profile_id: profileId,
        path_id: pathId,
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
 * NEW: Now includes perfect run, time tracking, and puzzle attempts
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
    // NEW: Real-time progress tracking
    completedIds?: string[];
    skippedIds?: string[];
    // NEW: Perfect run tracking
    isPerfectRunActive?: boolean;
    perfectRunStartScore?: number;
    perfectRunStreak?: number;
    hasSeenThresholdModal?: boolean;
    // NEW: Time tracking
    totalTimeSpent?: number;
    isPaused?: boolean;
    // NEW: Per-puzzle attempts (JSONB)
    puzzleAttempts?: Record<string, any>;
  }
) {
  if (!supabase) {
    console.error('❌ Supabase client not initialized!');
    return false;
  }

  console.log('🔄 Syncing to Supabase:', {
    profileId,
    pathId,
    completedIds: updates.completedIds,
    skippedIds: updates.skippedIds,
    score: updates.score,
  });

  try {
    const { data, error } = await supabase
      .from('active_sessions')
      .upsert({
        profile_id: profileId,
        path_id: pathId,
        current_puzzle_id: updates.currentPuzzleId,
        shuffled_queue: updates.shuffledQueue,
        attempts_made: updates.attemptsMade,
        score: updates.score,
        mistakes: updates.mistakes,
        // NEW: Real-time progress (critical for mid-quiz persistence)
        completed_ids: updates.completedIds,
        skipped_ids: updates.skippedIds,
        // NEW: Perfect run fields
        is_perfect_run_active: updates.isPerfectRunActive,
        perfect_run_start_score: updates.perfectRunStartScore,
        perfect_run_streak: updates.perfectRunStreak,
        has_seen_threshold_modal: updates.hasSeenThresholdModal,
        // NEW: Time tracking
        total_time_spent: updates.totalTimeSpent,
        is_paused: updates.isPaused,
        // NEW: Puzzle attempts
        puzzle_attempts: updates.puzzleAttempts,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'profile_id,path_id',
      })
      .select();

    if (error) {
      console.error('❌ Supabase sync error:', error);
      return false;
    }

    console.log('✅ Supabase sync successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase sync exception:', error);
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
 * NEW: Now includes detailed stats (first-try rate, avg time, perfect run tracking)
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
    timeTaken?: number;
    // NEW: Detailed stats
    totalQuestions?: number;
    firstTryCount?: number;
    firstTryRate?: number;
    skippedCount?: number;
    avgTimePerQuestion?: number;
    perfectRunCompleted?: boolean;
    thresholdDecision?: string;
    // NEW: Completion-based unlock system
    nextPathUnlockAt?: string;
    // NEW: Tiered reward flags
    isKeyUnlocked?: boolean;
    isBonusUnlocked?: boolean;
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
        completed_ids: data.completedIds,
        skipped_ids: data.skippedIds,
        final_score: data.finalScore,
        completed_at: new Date().toISOString(),
        // Performance tracking (existing)
        time_taken: data.timeTaken,
        accuracy: data.accuracy,
        mistakes: data.mistakes,
        themed_title: data.themedTitle,
        // NEW: Detailed stats
        total_questions: data.totalQuestions,
        first_try_count: data.firstTryCount,
        first_try_rate: data.firstTryRate,
        skipped_count: data.skippedCount,
        avg_time_per_question: data.avgTimePerQuestion,
        perfect_run_completed: data.perfectRunCompleted,
        threshold_decision: data.thresholdDecision,
        // NEW: Completion-based unlock system
        next_path_unlock_at: data.nextPathUnlockAt,
        // NEW: Tiered reward flags
        is_key_unlocked: data.isKeyUnlocked ?? false,
        is_bonus_unlocked: data.isBonusUnlocked ?? false,
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

/**
 * Initialize quest progress and active session for a path
 */
export async function initializePathProgress(
  profileId: number,
  pathId: PathId,
  totalQuestions: number
) {
  if (!supabase) return false;

  try {
    // Initialize quest_progress
    const { error: progressError } = await supabase
      .from('quest_progress')
      .upsert({
        profile_id: profileId,
        path_id: pathId,
        total_questions: totalQuestions,
      }, {
        onConflict: 'profile_id,path_id',
        ignoreDuplicates: true,
      });

    if (progressError) {
      console.error('Error initializing quest progress:', progressError);
      return false;
    }

    // Initialize active_sessions
    const { error: sessionError } = await supabase
      .from('active_sessions')
      .upsert({
        profile_id: profileId,
        path_id: pathId,
        shuffled_queue: { remaining: [], skipped: [] },
      }, {
        onConflict: 'profile_id,path_id',
        ignoreDuplicates: true,
      });

    if (sessionError) {
      console.error('Error initializing active session:', sessionError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error initializing path progress:', error);
    return false;
  }
}

/**
 * Record a question attempt in the database
 */
export async function recordQuestionAttempt(
  profileId: number,
  pathId: PathId,
  questionId: string,
  attemptNumber: number,
  answerGiven: string,
  isCorrect: boolean,
  wasClose: boolean
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('question_attempts')
      .insert({
        profile_id: profileId,
        path_id: pathId,
        question_id: questionId,
        attempt_number: attemptNumber,
        answer_given: answerGiven,
        is_correct: isCorrect,
        was_close: wasClose,
      });

    if (error) {
      console.error('Error recording attempt:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording attempt:', error);
    return false;
  }
}

/**
 * Update quest progress after correct answer
 */
export async function updateQuestProgress(
  profileId: number,
  pathId: PathId,
  questionId: string,
  attemptsUsed: number,
  wasReattempted: boolean
) {
  if (!supabase) return false;

  try {
    const field =
      attemptsUsed === 1 ? 'correct_first_try' :
      attemptsUsed === 2 ? 'correct_second_try' :
      'correct_after_reattempt';

    const { error } = await supabase.rpc('increment_quest_stat', {
      p_profile_id: profileId,
      p_path_id: pathId,
      p_field: field,
      p_question_id: questionId,
      p_attempts_used: attemptsUsed,
      p_was_reattempted: wasReattempted,
    });

    if (error) {
      console.error('Error updating quest progress:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating quest progress:', error);
    return false;
  }
}

/**
 * Move question to skipped queue after 2 failed attempts
 */
export async function moveQuestionToSkipped(
  profileId: number,
  pathId: PathId,
  questionId: string
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase.rpc('move_to_skipped', {
      p_profile_id: profileId,
      p_path_id: pathId,
      p_question_id: questionId,
    });

    if (error) {
      console.error('Error moving to skipped:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error moving to skipped:', error);
    return false;
  }
}

/**
 * Remove question from skipped queue after successful re-attempt
 */
export async function removeFromSkipped(
  profileId: number,
  pathId: PathId,
  questionId: string
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase.rpc('remove_from_skipped', {
      p_profile_id: profileId,
      p_path_id: pathId,
      p_question_id: questionId,
    });

    if (error) {
      console.error('Error removing from skipped:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing from skipped:', error);
    return false;
  }
}

/**
 * Check for new achievements and return them
 */
export async function checkAchievements(
  profileId: number,
  pathId: PathId
): Promise<Array<{ type: string; data: any }>> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.rpc('check_achievements', {
      p_profile_id: profileId,
      p_path_id: pathId,
    });

    if (error) {
      console.error('Error checking achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

/**
 * Mark achievements as displayed
 */
export async function markAchievementsDisplayed(
  profileId: number,
  achievementTypes: string[]
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('achievements')
      .update({ was_displayed: true })
      .eq('profile_id', profileId)
      .in('achievement_type', achievementTypes);

    if (error) {
      console.error('Error marking achievements as displayed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error marking achievements as displayed:', error);
    return false;
  }
}

/**
 * Get skipped questions for a path
 */
export async function getSkippedQuestions(
  profileId: number,
  pathId: PathId
): Promise<string[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('active_sessions')
      .select('shuffled_queue')
      .eq('profile_id', profileId)
      .eq('path_id', pathId)
      .single();

    if (error || !data) {
      console.error('Error fetching skipped questions:', error);
      return [];
    }

    return (data.shuffled_queue as any)?.skipped || [];
  } catch (error) {
    console.error('Error fetching skipped questions:', error);
    return [];
  }
}

/**
 * Get current puzzle attempt count
 */
export async function getCurrentAttemptCount(
  profileId: number,
  pathId: PathId,
  questionId: string
): Promise<number> {
  if (!supabase) return 0;

  try {
    const { data, error } = await supabase
      .from('question_attempts')
      .select('attempt_number')
      .eq('profile_id', profileId)
      .eq('path_id', pathId)
      .eq('question_id', questionId)
      .order('attempt_number', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      return 0;
    }

    return data[0].attempt_number;
  } catch (error) {
    console.error('Error fetching attempt count:', error);
    return 0;
  }
}

/**
 * Update active session current puzzle
 */
export async function updateActiveSession(
  profileId: number,
  pathId: PathId,
  currentPuzzleId: string | null,
  currentAttempts: number
) {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('active_sessions')
      .update({
        current_puzzle_id: currentPuzzleId,
        current_puzzle_attempts: currentAttempts,
        last_activity_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (error) {
      console.error('Error updating active session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating active session:', error);
    return false;
  }
}

/**
 * HARD RESET: Delete all progress for a specific path
 * Removes rows from both active_sessions and quest_progress tables
 * Used for complete path reset in debug/testing scenarios
 */
export async function deletePathProgress(profileId: number, pathId: PathId) {
  if (!supabase) {
    console.error('❌ Supabase client not initialized!');
    return false;
  }

  console.log('🗑️ Hard Reset: Deleting path progress for:', {
    profileId,
    pathId,
  });

  try {
    // Delete from active_sessions
    const { error: sessionError } = await supabase
      .from('active_sessions')
      .delete()
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (sessionError) {
      console.error('Error deleting active session:', sessionError);
      return false;
    }

    // Delete from quest_progress
    const { error: progressError } = await supabase
      .from('quest_progress')
      .delete()
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (progressError) {
      console.error('Error deleting quest progress:', progressError);
      return false;
    }

    console.log('✅ Hard Reset: Successfully deleted all progress for path', pathId);
    return true;
  } catch (error) {
    console.error('Error during hard reset:', error);
    return false;
  }
}

/**
 * Update unlock flags without overwriting other completion data
 * CRITICAL: Enforces non-revocable rule for is_key_unlocked
 */
export async function updateUnlockFlags(
  profileId: number,
  pathId: PathId,
  flags: {
    isKeyUnlocked?: boolean;
    isBonusUnlocked?: boolean;
  }
) {
  if (!supabase) return false;

  try {
    // NEVER allow revoking key unlock
    if (flags.isKeyUnlocked === false) {
      console.warn('Attempted to revoke key unlock - operation blocked');
      return false;
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (flags.isKeyUnlocked === true) {
      updateData.is_key_unlocked = true;
    }

    if (flags.isBonusUnlocked !== undefined) {
      updateData.is_bonus_unlocked = flags.isBonusUnlocked;
    }

    const { error } = await supabase
      .from('quest_progress')
      .update(updateData)
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (error) {
      console.error('Error updating unlock flags:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating unlock flags:', error);
    return false;
  }
}

/**
 * Reset path progress (for testing purposes)
 * Deletes path_stats entry and resets quest_progress for the given path
 */
export async function resetPathProgress(agentId: number, pathId: number): Promise<boolean> {
  try {
    // Get profile ID from agent ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('agent_id', agentId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile for reset:', profileError);
      return false;
    }

    const profileId = profile.id;

    // Delete path_stats entry
    const { error: statsError } = await supabase
      .from('path_stats')
      .delete()
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (statsError) {
      console.error('Error deleting path_stats:', statsError);
    }

    // Reset quest_progress for this path
    const { error: progressError } = await supabase
      .from('quest_progress')
      .update({
        completed_ids: [],
        skipped_ids: [],
        mistakes: 0,
        total_time_spent: 0,
        is_completed: false,
        completed_at: null,
        is_key_unlocked: false,
        is_bonus_unlocked: false,
        is_bonus_mode: false,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (progressError) {
      console.error('Error resetting quest_progress:', progressError);
      return false;
    }

    // Also reset active_sessions for this path
    const { error: sessionError } = await supabase
      .from('active_sessions')
      .update({
        completed_ids: [],
        skipped_ids: [],
        mistakes: 0,
        total_time_spent: 0,
        is_bonus_mode: false,
        is_perfect_run_active: false,
        perfect_run_streak: 0,
        puzzle_attempts: {},
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', profileId)
      .eq('path_id', pathId);

    if (sessionError) {
      console.error('Error resetting active_sessions:', sessionError);
    }

    console.log(`✅ Path ${pathId} reset in database for agent ${agentId}`);
    return true;
  } catch (error) {
    console.error('Error resetting path progress:', error);
    return false;
  }
}
