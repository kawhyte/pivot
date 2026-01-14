import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, AlertCircle } from 'lucide-react';
import { verifyPasscode, type AgentProfile } from '@/lib/auth';
import { useQuestStore } from '@/store/useQuestStore';
import { useNavigate } from 'react-router-dom';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success';
  timestamp?: string;
}

export const AccessTerminal = () => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [lines, setLines] = useState<TerminalLine[]>([
    { text: '> INITIALIZING SECURE TERMINAL...', type: 'output' },
    { text: '> SYSTEM READY', type: 'success' },
    { text: '> ENTER ACCESS CODE:', type: 'output' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const { setAuthentication } = useQuestStore();

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isProcessing) return;

    const code = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);

    // Add input line
    setLines((prev) => [
      ...prev,
      { text: `> ${code}`, type: 'input' },
      { text: '> DECRYPTING...', type: 'output' },
    ]);

    // Simulate decryption with random character cycling (1200ms)
    const decryptionChars = '█▓▒░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';
    let decryptionInterval: NodeJS.Timeout;
    let decryptionText = '';

    decryptionInterval = setInterval(() => {
      decryptionText = Array.from({ length: code.length }, () =>
        decryptionChars[Math.floor(Math.random() * decryptionChars.length)]
      ).join('');

      setLines((prev) => {
        const newLines = [...prev];
        newLines[newLines.length - 1] = {
          text: `> DECRYPTING... ${decryptionText}`,
          type: 'output',
        };
        return newLines;
      });
    }, 50);

    // Wait 1200ms for decryption animation
    await new Promise((resolve) => setTimeout(resolve, 1200));
    clearInterval(decryptionInterval);

    // Verify the passcode
    const profile: AgentProfile | null = await verifyPasscode(code);

    if (profile) {
      // SUCCESS
      setLines((prev) => [
        ...prev.slice(0, -1), // Remove "DECRYPTING..." line
        { text: '> IDENTITY CONFIRMED', type: 'success' },
        { text: `> WELCOME, ${profile.name}`, type: 'success' },
        { text: `> ROLE: ${profile.role}`, type: 'output' },
        { text: '> DEPLOYING QUEST_PROTOCOL...', type: 'output' },
      ]);

      // Save authentication to store
      setAuthentication(true, profile.name, profile.role || 'Agent', profile.id, profile.isTester);

      // Redirect to hub after 1 second
      setTimeout(() => {
        navigate('/hub');
      }, 1000);
    } else {
      // FAILURE
      setLines((prev) => [
        ...prev.slice(0, -1), // Remove "DECRYPTING..." line
        { text: '> ERROR: UNAUTHORIZED ACCESS ATTEMPT', type: 'error' },
        { text: '> ACCESS DENIED. SHUTTING DOWN.', type: 'error' },
      ]);

      // Trigger shake animation
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);

      // Reset after 2 seconds
      setTimeout(() => {
        setLines([
          { text: '> SYSTEM RESTARTING...', type: 'output' },
          { text: '> ENTER ACCESS CODE:', type: 'output' },
        ]);
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 px-6 py-12 font-['JetBrains_Mono']">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
          }}
        />
      </div>

      {/* Terminal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: shakeTrigger ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: 0.3 }}
        className="relative mx-auto w-full max-w-2xl"
      >
        {/* Terminal Header */}
        <div className="flex items-center gap-2 rounded-t-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
          <Terminal className="h-4 w-4 text-emerald-500" />
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
            Secure Access Terminal v2.7.1
          </span>
          <div className="ml-auto flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
          </div>
        </div>

        {/* Terminal Body */}
        <div
          ref={scrollRef}
          className="h-96 overflow-y-auto rounded-b-lg border border-t-0 border-zinc-800 bg-zinc-950 p-4"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.03) 0%, transparent 70%)',
          }}
        >
          {/* Terminal Lines */}
          <div className="space-y-1">
            {lines.map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`font-mono text-sm ${
                  line.type === 'input'
                    ? 'text-zinc-300'
                    : line.type === 'error'
                    ? 'text-red-500'
                    : line.type === 'success'
                    ? 'text-emerald-500'
                    : 'text-zinc-500'
                }`}
                style={
                  line.type === 'success' || line.type === 'error'
                    ? {
                        textShadow: `0 0 10px ${
                          line.type === 'success'
                            ? 'rgba(16, 185, 129, 0.4)'
                            : 'rgba(239, 68, 68, 0.4)'
                        }`,
                      }
                    : undefined
                }
              >
                {line.text}
              </motion.div>
            ))}

            {/* Input Form */}
            {!isProcessing && (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <span className="font-mono text-sm text-zinc-500">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1 border-none bg-transparent font-mono text-sm text-zinc-300 outline-none placeholder:text-zinc-700"
                  placeholder="ENTER CODE..."
                  autoComplete="off"
                  spellCheck="false"
                />
                {showCursor && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-mono text-sm text-emerald-500"
                  >
                    _
                  </motion.span>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Warning Indicator */}
        {shakeTrigger && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="font-mono text-xs uppercase text-red-500">
              Security breach attempt logged
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="font-mono text-xs text-zinc-700 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
};
