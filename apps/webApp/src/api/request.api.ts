import http from '.';

export enum CheckStatus {
  PASS = 'PASS',
  DENIED = 'DENY',
}

export interface RoutineRequest {
  id: number;
  routineId: number;
  nickname: string;
  routineName: string;
  createdAt: string;
}

export interface RoutineRequestDetail {
  id: number;
  nickname: string;
  requesterNickname: string;
  routineName: string;
  routineDetail: string;
  imagePath: string;
  createdAt: string;
}

export interface RoutineRequestCheckForm {
  confirmId: number;
  checkStatus: CheckStatus;
  checkComment: string;
}

export const fetchReceivedRequests = async (
  nickname: string,
): Promise<RoutineRequest[]> => {
  return http.get(`/routine/confirm/list?nickname=${nickname}`);
};

export const fetchRequestDetail = async (
  id: number,
): Promise<RoutineRequestDetail> => {
  return http.get(`/routine/confirm/detail?id=${id}`);
};

export const createRequest = async (data: FormData): Promise<void> => {
  return http.post(`/routine/confirm`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const replyRequest = async (
  data: RoutineRequestCheckForm,
): Promise<void> => {
  return http.post('/routine/check', data, {
    method: 'POST',
  });
};
