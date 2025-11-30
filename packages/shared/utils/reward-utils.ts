/**
 * @fileoverview Reward utility functions for date formatting and type handling
 * @module reward-utils
 */

import type { Reward } from '@repo/types';

/**
 * Formats an ISO 8601 date string to "MM/DD" format
 *
 * @param {string} isoDate - ISO 8601 date string (e.g., "2025-10-28T17:42:50.061205")
 * @returns {string} Formatted date in "MM/DD" format (e.g., "10/28")
 * @throws {Error} If the date string is invalid
 *
 * @example
 * formatRewardDate("2025-10-28T17:42:50.061205") // returns "10/28"
 * formatRewardDate("2025-01-05T12:30:00Z") // returns "01/05"
 */
export const formatRewardDate = (isoDate: string): string => {
  if (!isoDate || typeof isoDate !== 'string') {
    throw new Error('Invalid date format');
  }

  const date = new Date(isoDate);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${month}/${day}`;
};

/**
 * Truncates a reward name to a maximum length and adds ellipsis if needed
 *
 * @param {string} name - Reward name to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated name with "..." if longer than maxLength
 *
 * @example
 * truncateRewardName("첫 퀘스트 뱃지", 8) // returns "첫 퀘스트 ..."
 * truncateRewardName("짧은 제목", 20) // returns "짧은 제목"
 */
export const truncateRewardName = (name: string, maxLength: number): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  if (name.length <= maxLength) {
    return name;
  }

  return `${name.slice(0, maxLength)}...`;
};

/**
 * Returns CSS class names for reward type badge styling
 *
 * @param {Reward['rewardType']} type - Reward type (BADGE or EXP)
 * @returns {string} CSS class names for badge styling
 *
 * @example
 * getRewardTypeBadgeColor("BADGE") // returns "bg-blue-500 text-white"
 * getRewardTypeBadgeColor("EXP") // returns "bg-green-500 text-white"
 */
export const getRewardTypeBadgeColor = (type: Reward['rewardType']): string => {
  switch (type) {
    case 'BADGE':
      return 'bg-blue-500 text-white';
    case 'EXP':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};
