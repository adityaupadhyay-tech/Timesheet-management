import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * @param {...any} inputs - Class values to combine
 * @returns {string} Combined class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
