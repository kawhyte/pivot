/**
 * KeyIcon component for custom key SVG
 *
 * NOTE: Color support with <img> tags is limited. For proper color support:
 * 1. The SVG file should use 'currentColor' for fill/stroke attributes
 * 2. Or consider converting to inline SVG component for full color control
 *
 * Current implementation uses CSS color which works if the SVG uses currentColor
 */
interface KeyIconProps {
  className?: string;
  color?: string;
}

export const KeyIcon = ({ className = 'h-12 w-12', color }: KeyIconProps) => (
  <img
    className={className}
    src="/images/key.svg"
    alt="Key"
    style={color ? { color } : undefined}
  />
);
