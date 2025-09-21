export const errorMessages: Record<string, string> = {
  // Auth
  AUTH_INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다.',
  AUTH_TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',

  // User
  USER_NOT_FOUND: '해당 사용자를 찾을 수 없습니다.',
  USER_DUPLICATED: '이미 존재하는 사용자입니다.',

  // Default
  UNKNOWN: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};
