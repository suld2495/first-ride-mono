/**
 * className 병합 유틸리티
 * Tailwind CSS 클래스 충돌을 해결하고 올바르게 병합
 *
 * @example
 * cn('text-gray-500', 'text-blue-500') // 'text-blue-500' (나중 것이 우선)
 * cn('text-gray-500', className) // className이 우선
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
