interface SparklesIconProps {
  className?: string;
}

export const SparklesIcon = ({ className = 'h-10 w-10' }: SparklesIconProps) => (
  <img className={className} src="/images/sparkle.svg" alt="Sparkles" />
);
