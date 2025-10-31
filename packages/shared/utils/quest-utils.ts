/**
 * @fileoverview Quest utility functions for date formatting and validation
 * @module quest-utils
 */

import type { QuestForm } from '@repo/types';

/**
 * Formats an ISO 8601 date string to "MM/DD" format
 *
 * @param {string} isoDate - ISO 8601 date string (e.g., "2024-10-27T00:00:00Z")
 * @returns {string} Formatted date in "MM/DD" format (e.g., "10/27")
 * @throws {Error} If the date string is invalid
 *
 * @example
 * formatDate("2024-10-27T00:00:00Z") // returns "10/27"
 * formatDate("2024-01-05T12:30:00Z") // returns "01/05"
 */
export const formatDate = (isoDate: string): string => {
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
 * Formats a quest period from start and end dates to "MM/DD-MM/DD" format
 *
 * @param {string} startDate - ISO 8601 start date string
 * @param {string} endDate - ISO 8601 end date string
 * @returns {string} Formatted period (e.g., "10/27-10/28")
 * @throws {Error} If either date string is invalid
 *
 * @example
 * formatQuestPeriod("2024-10-27T00:00:00Z", "2024-10-28T23:59:59Z") // returns "10/27-10/28"
 */
export const formatQuestPeriod = (
  startDate: string,
  endDate: string,
): string => {
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  return `${formattedStart}-${formattedEnd}`;
};

/**
 * Truncates a quest name to a maximum length and adds ellipsis if needed
 *
 * @param {string} name - Quest name to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated name with "..." if longer than maxLength
 *
 * @example
 * truncateQuestName("첫 루틴 완성하기", 8) // returns "첫 루틴 완성..."
 * truncateQuestName("짧은 제목", 20) // returns "짧은 제목"
 */
export const truncateQuestName = (name: string, maxLength: number): string => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  if (name.length <= maxLength) {
    return name;
  }

  return `${name.slice(0, maxLength)}...`;
};

/**
 * Validates that the end date is on or after the start date
 *
 * @param {string} startDate - ISO 8601 start date string
 * @param {string} endDate - ISO 8601 end date string
 * @returns {boolean} True if endDate >= startDate, false otherwise
 *
 * @example
 * isEndDateValid("2024-10-27", "2024-10-28") // returns true
 * isEndDateValid("2024-10-28", "2024-10-27") // returns false
 */
export const isEndDateValid = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return end >= start;
};

/**
 * Validates a quest form and returns validation errors
 *
 * @param {QuestForm} form - Quest form data to validate
 * @returns {Record<string, string>} Object with field names as keys and error messages as values
 *
 * @example
 * validateQuestForm({ questName: "", questType: "DAILY", ... })
 * // returns { questName: "퀘스트명을 입력해주세요" }
 */
export const validateQuestForm = (
  form: Partial<QuestForm>,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Quest name validation
  if (!form.questName || form.questName.trim() === '') {
    errors.questName = '퀘스트명을 입력해주세요';
  } else if (form.questName.length > 50) {
    errors.questName = '퀘스트명은 50자 이내로 입력해주세요';
  }

  // Quest type validation
  if (!form.questType) {
    errors.questType = '퀘스트 타입을 선택해주세요';
  } else if (form.questType !== 'DAILY' && form.questType !== 'WEEKLY') {
    errors.questType = '퀘스트 타입을 선택해주세요';
  }

  // Description validation
  if (!form.description || form.description.trim() === '') {
    errors.description = '설명을 입력해주세요';
  } else if (form.description.length > 200) {
    errors.description = '설명은 200자 이내로 입력해주세요';
  }

  // Reward ID validation
  if (form.rewardId === undefined || form.rewardId === null) {
    errors.rewardId = '보상을 선택해주세요';
  }

  // Start date validation
  if (!form.startDate || form.startDate.trim() === '') {
    errors.startDate = '시작일을 입력해주세요';
  }

  // End date validation
  if (!form.endDate || form.endDate.trim() === '') {
    errors.endDate = '종료일을 입력해주세요';
  } else if (form.startDate && !isEndDateValid(form.startDate, form.endDate)) {
    errors.endDate = '종료일은 시작일 이후여야 합니다';
  }

  // Required level validation
  if (form.requiredLevel === undefined || form.requiredLevel === null) {
    errors.requiredLevel = '필요 레벨을 입력해주세요';
  } else if (form.requiredLevel < 1) {
    errors.requiredLevel = '1 이상의 숫자를 입력해주세요';
  }

  // Max participants validation (optional field)
  if (
    form.maxParticipants !== undefined &&
    form.maxParticipants !== null &&
    form.maxParticipants < 0
  ) {
    errors.maxParticipants = '0 이상의 숫자를 입력해주세요';
  }

  return errors;
};
