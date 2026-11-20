import type { LucideIcon } from 'lucide-react';
import { FC } from 'react';

import { cn } from '@nuclearplayer/ui';

import type { Accent } from '../types';

const accentSurfaces: Record<Accent, string> = {
  green: 'surface-accent-green',
  yellow: 'surface-accent-yellow',
  purple: 'surface-accent-purple',
  blue: 'surface-accent-blue',
  orange: 'surface-accent-orange',
  cyan: 'surface-accent-cyan',
  red: 'surface-accent-red',
};

const sizeClasses = {
  sm: 'size-8 rounded',
  md: 'size-11 rounded-md',
  lg: 'size-14 rounded-md',
};

const iconSizes = {
  sm: 16,
  md: 22,
  lg: 28,
};

type AppIconProps = {
  icon: LucideIcon;
  accent: Accent;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export const AppIcon: FC<AppIconProps> = ({
  icon: Icon,
  accent,
  size = 'md',
  className,
}) => (
  <span
    aria-hidden
    className={cn(
      'border-border shadow-shadow flex shrink-0 items-center justify-center border-2',
      accentSurfaces[accent],
      sizeClasses[size],
      className,
    )}
  >
    <Icon size={iconSizes[size]} strokeWidth={2.25} />
  </span>
);
