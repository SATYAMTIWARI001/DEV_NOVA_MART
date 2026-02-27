'use client';

import { cn } from '@/lib/utils';
import { Platform } from '@/lib/types';

interface PlatformLogoProps {
  platform: Platform;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const platformConfig = {
  Amazon: {
    name: 'Amazon',
    bgClass: 'bg-amazon',
    textClass: 'text-foreground',
    letter: 'A',
  },
  Flipkart: {
    name: 'Flipkart',
    bgClass: 'bg-flipkart',
    textClass: 'text-primary-foreground',
    letter: 'F',
  },
  Meesho: {
    name: 'Meesho',
    bgClass: 'bg-meesho',
    textClass: 'text-primary-foreground',
    letter: 'M',
  },
};

const sizeConfig = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
};

export function PlatformLogo({ platform, size = 'md', className }: PlatformLogoProps) {
  const config = platformConfig[platform];
  
  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center font-bold shadow-sm',
        config.bgClass,
        config.textClass,
        sizeConfig[size],
        className
      )}
      title={config.name}
    >
      {config.letter}
    </div>
  );
}

interface PlatformBadgeProps {
  platform: Platform;
  className?: string;
}

export function PlatformBadge({ platform, className }: PlatformBadgeProps) {
  const config = platformConfig[platform];
  
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className="font-bold">{config.letter}</span>
      <span>{config.name}</span>
    </div>
  );
}
