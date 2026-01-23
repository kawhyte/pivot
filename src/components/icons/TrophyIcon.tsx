interface TrophyIconProps {
  className?: string;
}

export const TrophyIcon = ({ className = 'h-24 w-24' }: TrophyIconProps) => (
  <img className={className} src="/images/trophy.svg" alt="Trophy" />
);
