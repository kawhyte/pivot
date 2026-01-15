import { useEffect, useState } from 'react';

/**
 * Hook for Debug Panel Keyboard Shortcut
 * Toggles panel with Ctrl+Shift+D (or Cmd+Shift+D on Mac)
 */
export const useDebugPanel = (isEnabled: boolean = false) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+D (Windows/Linux) or Cmd+Shift+D (Mac)
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled]);

  return { isOpen, setIsOpen };
};
