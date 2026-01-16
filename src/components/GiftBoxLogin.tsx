import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Lock, AlertCircle, KeyRound } from 'lucide-react';
import { verifyPasscode, type AgentProfile } from '@/lib/auth';
import { useQuestStore } from '@/store/useQuestStore';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { initializePathProgress } from '@/lib/supabase-sync';

export const GiftBoxLogin = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const { setAuthentication } = useQuestStore();

  // Focus input when login form opens
  useEffect(() => {
    if (showLoginForm && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [showLoginForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isProcessing) return;

    const code = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setShowError(false);

    // Simulate "processing" animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Verify the passcode
      const profile: AgentProfile | null = await verifyPasscode(code);

      if (profile) {
        // SUCCESS
        setAgentProfile(profile);
        setShowSuccess(true);

        // Celebration confetti (reduced particles)
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#58CC02', '#88D843', '#FFC800'],
        });

        // Save authentication to store (with isTester flag)
        setAuthentication(true, profile.name, profile.role, profile.id, profile.isTester);

        // Initialize all 3 paths for this user
        console.log('Initializing paths for user:', profile.id);
        await Promise.all([
          initializePathProgress(profile.id, 1, 15),
          initializePathProgress(profile.id, 2, 15),
          initializePathProgress(profile.id, 3, 15),
        ]);

        // Redirect to hub after celebration
        setTimeout(() => {
          navigate('/hub');
        }, 2000);
      } else {
        // FAILURE
        setShowError(true);
        setShakeTrigger(true);
        setTimeout(() => setShakeTrigger(false), 500);

        // Reset after 2 seconds
        setTimeout(() => {
          setShowError(false);
          setIsProcessing(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setShowError(true);
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);

      // Reset after 2 seconds
      setTimeout(() => {
        setShowError(false);
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-b from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Decorative Background Accents (Duolingo-style) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-duolingo-green/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-warning-orange/3 rounded-full blur-3xl" />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              x: shakeTrigger ? [0, -10, 10, -10, 10, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl text-center relative z-10"
          >
            {!showLoginForm ? (
              /* Hero Section */
              <>
                {/* Icon */}
                <div
                
                  className="mb-8 flex justify-center"
                > <img className=' w-60 ' src='/images/lady.svg'/>
               
                </div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6 text-6xl font-black text-neutral-900 leading-tight"
                >
                  Birthday Quest
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-4 text-2xl font-bold text-neutral-700"
                >
                  A Special Surprise Awaits
                </motion.p>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-12 text-lg text-neutral-600 max-w-xl mx-auto"
                >
                  Complete three themed quests to unlock your birthday vault. Each path is filled with puzzles crafted just for you.
                </motion.p>

                {/* CTA Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setShowLoginForm(true)}
                  className="duo-button px-12 py-6 text-2xl font-black mx-auto"
                  style={{
                    backgroundColor: '#58CC02',
                    color: '#FFFFFF',
                  }}
                >
                  GET STARTED
                </motion.button>

                {/* Features */}
                {/* <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                >
                  <div className="text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="h-12 w-12 rounded-full bg-path-pop-purple/10 flex items-center justify-center">
                        <KeyRound className="h-6 w-6 text-path-pop-purple" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">3 Unique Paths</h3>
                    <p className="text-sm text-neutral-600">Pop Culture, Renaissance, and Heart-themed quests</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="h-12 w-12 rounded-full bg-path-renaissance-blue/10 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-path-renaissance-blue" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">Unlock Your Vault</h3>
                    <p className="text-sm text-neutral-600">Collect all 3 keys to reveal your birthday surprise</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-3 flex justify-center">
                      <div className="h-12 w-12 rounded-full bg-path-heart-pink/10 flex items-center justify-center">
                        <Gift className="h-6 w-6 text-path-heart-pink" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">Made With Love</h3>
                    <p className="text-sm text-neutral-600">A handcrafted adventure designed just for you</p>
                  </div>
                </motion.div> */}
              </>
            ) : (
              /* Login Form */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="space-y-6 max-w-md mx-auto"
              >
                {/* Back Button */}
                <button
                  onClick={() => setShowLoginForm(false)}
                  className="mb-4 text-lg font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  ← Back
                </button>

                {/* Login Card */}
                <div className="duo-card bg-white p-8 shadow-xl">
                  
<img className='mx-auto mb-4 h-16 w-16' src='images/smile-yellow.svg'/>
                  <h2 className="mb-2 text-2xl font-black text-neutral-900">
                    Enter Your Code
                  </h2>
                  <p className="mb-6 text-base text-neutral-600">
                    Use your secret access code to begin the quest
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isProcessing}
                      placeholder="MOONLIGHT-747"
                      className="duo-input w-full h-16 text-center text-lg font-semibold uppercase tracking-wider disabled:opacity-50"
                      autoComplete="off"
                      spellCheck="false"
                    />

                    <button
                      type="submit"
                      disabled={inputValue.trim() === '' || isProcessing}
                      className="duo-button w-full py-4 text-lg font-bold disabled:opacity-50"
                      style={{
                        backgroundColor: inputValue.trim() === '' || isProcessing ? '#E5E5E5' : '#58CC02',
                        color: inputValue.trim() === '' || isProcessing ? '#AFAFAF' : '#FFFFFF',
                      }}
                    >
                      {isProcessing ? 'Verifying...' : 'Start Quest'}
                    </button>
                  </form>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {showError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="duo-card flex items-center gap-3 bg-red-50 border-error-red px-4 py-3"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-error-red" />
                      <p className="text-sm font-semibold text-neutral-900">
                        Access Denied. Check your code and try again.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Success Screen */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center relative z-10"
          >
            <div className="duo-card bg-white p-12">
              <div className="mb-6 flex justify-center">
                <div className="h-20 w-20 rounded-full bg-duolingo-green/10 flex items-center justify-center">
                  <Gift className="h-10 w-10 text-duolingo-green" strokeWidth={2} />
                </div>
              </div>

              <h2 className="mb-2 text-3xl font-black text-neutral-900">
                Welcome Back!
              </h2>
              <p className="text-xl font-bold text-duolingo-green mb-4">
                {agentProfile?.name}
              </p>
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wider">
                {agentProfile?.role}
              </p>

              <div className="mt-6 text-sm text-neutral-700">
                Loading your quest...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
