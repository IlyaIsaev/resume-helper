import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const FONT_SIZE_CLASSES = [
  'text-label',
  'text-ui',
  'text-heading',
  'text-stat',
  'text-hero',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [...FONT_SIZE_CLASSES],
    },
  },
});

export function cn(...inputs: Array<ClassValue>): string {
  return twMerge(clsx(inputs));
}
