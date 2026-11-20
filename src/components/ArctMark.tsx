import { FC } from 'react';

import { cn } from '@nuclearplayer/ui';

type ArctMarkProps = {
  className?: string;
};

export const ArctMark: FC<ArctMarkProps> = ({ className }) => (
  <svg
    viewBox="0 0 64 64"
    role="img"
    aria-label="Arct Studio"
    className={cn('shrink-0', className)}
  >
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="12"
      fill="var(--primary)"
      stroke="var(--border)"
      strokeWidth="4"
    />
    <path
      d="M32 13 L49 51 H40 L32 31 L24 51 H15 Z"
      fill="var(--primary-foreground)"
    />
    <rect
      x="24"
      y="40"
      width="16"
      height="5"
      fill="var(--primary-foreground)"
    />
  </svg>
);
