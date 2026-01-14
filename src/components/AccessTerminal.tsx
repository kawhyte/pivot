import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { supabase } from '@/db';
  import { useQuestStore } from '@/store/useQuestStore';
  import { initializePathProgress } from '@/lib/supabase-sync';

  const VALID_CODES = ['BIRTHDAY2026', 'KENNY2026', 'TEST2026'];

  export const AccessTerminal = () => {
    const navigate = useNavigate();
    const { setAuthentication } = useQuestStore();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsSubmitting(true);

      console.log('Attempting login with code:', code.toUpperCase());

      try {
        const upperCode = code.toUpperCase().trim();

        // Check if code is valid
        if (!VALID_CODES.includes(upperCode)) {
          setError('Invalid access code. Try: TEST2026, KENNY2026, or BIRTHDAY2026');
          setIsSubmitting(false);
          return;
        }

        // Check Supabase connection
        if (!supabase) {
          setError('Database connection failed. Check console for errors.');
          console.error('Supabase is not initialized!');
          setIsSubmitting(false);
          return;
        }

        // Query database
        console.log('Querying database for code:', upperCode);
        const { data, error: dbError } = await supabase
          .from('profiles')
          .select('*')
          .eq('secret_code', upperCode)
          .single();

        console.log('Database response:', { data, error: dbError });

        if (dbError || !data) {
          setError(`Database error: ${dbError?.message || 'User not found'}`);
          console.error('Database error:', dbError);
          setIsSubmitting(false);
          return;
        }

        console.log('User found:', data);

        // Set authentication in Zustand
        setAuthentication(
          true,
          data.agent_name,
          data.is_tester ? 'Tester' : 'Agent',
          data.id,
          data.is_tester
        );

        // Initialize all paths
        console.log('Initializing paths for user:', data.id);
        await Promise.all([
          initializePathProgress(data.id, 1, 15),
          initializePathProgress(data.id, 2, 15),
          initializePathProgress(data.id, 3, 15),
        ]);

        console.log('Login successful! Navigating to hub...');
        navigate('/hub');
      } catch (err) {
        console.error('Login error:', err);
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter access code"
          className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-zinc-500"
          disabled={isSubmitting}
        />

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !code}
          className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Authenticating...' : 'Access System'}
        </button>

        <p className="text-center text-xs text-zinc-500">
          Test codes: TEST2026 | KENNY2026 | BIRTHDAY2026
        </p>
      </form>
    );
  };