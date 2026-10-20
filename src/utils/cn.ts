import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases condicionales con `clsx` y resuelve conflictos de utilidades
 * de Tailwind CSS con `tailwind-merge`.
 */
export function cn(...inputs: readonly ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
