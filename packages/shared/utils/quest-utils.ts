/**
 * @fileoverview Quest utility functions for date formatting and validation
 * @module quest-utils
 */

import type { QuestForm } from '@repo/types';

import { isMonday } from './date-utils';

const PAD_LENGTH = 2;
const MAX_QUEST_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
const MIN_REQUIRED_LEVEL = 1;

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

  const month = String(date.getMonth() + 1).padStart(PAD_LENGTH, '0');
  const day = String(date.getDate()).padStart(PAD_LENGTH, '0');

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
 * validateQuestForm({ questName: "", ... })
 * // returns { questName: "퀘스트명을 입력해주세요" }
 */
export const validateQuestForm = (
  form: Partial<QuestForm>,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const {
    description,
    endDate,
    maxParticipants,
    questName,
    questType,
    requiredLevel,
    rewardId,
    startDate,
  } = form;

  // Quest name validation
  if (!questName || questName.trim() === '') {
    errors.questName = '퀘스트명을 입력해주세요';
  } else if (questName.length > MAX_QUEST_NAME_LENGTH) {
    errors.questName = `퀘스트명은 ${MAX_QUEST_NAME_LENGTH}자 이내로 입력해주세요`;
  }

  // Quest type validation
  if (!questType) {
    errors.questType = '퀘스트 타입을 선택해주세요';
  }

  // Description validation
  if (!description || description.trim() === '') {
    errors.description = '설명을 입력해주세요';
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `설명은 ${MAX_DESCRIPTION_LENGTH}자 이내로 입력해주세요`;
  }

  // Reward ID validation
  if (rewardId === undefined) {
    errors.rewardId = '보상을 선택해주세요';
  }

  // Start date validation
  if (!startDate || startDate.trim() === '') {
    errors.startDate = '시작일을 입력해주세요';
  } else if (!isMonday(new Date(startDate))) {
    errors.startDate = '시작일은 월요일만 선택할 수 있습니다';
  }

  // End date validation
  if (!endDate || endDate.trim() === '') {
    errors.endDate = '종료일을 입력해주세요';
  } else if (startDate !== undefined && !isEndDateValid(startDate, endDate)) {
    errors.endDate = '종료일은 시작일 이후여야 합니다';
  }

  // Required level validation
  if (requiredLevel === undefined) {
    errors.requiredLevel = '필요 레벨을 입력해주세요';
  } else if (requiredLevel < MIN_REQUIRED_LEVEL) {
    errors.requiredLevel = `${MIN_REQUIRED_LEVEL} 이상의 숫자를 입력해주세요`;
  }

  // Max participants validation (optional field)
  if (maxParticipants !== undefined && maxParticipants < 0) {
    errors.maxParticipants = '0 이상의 숫자를 입력해주세요';
  }

  return errors;
};
