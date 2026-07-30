import { Routine } from './routine';

export type RequestResponseStatus = 'DENY' | 'PASS';
export type RequestStatus = 'WAIT' | RequestResponseStatus;

export type Request = {
  id: number;
  image: string;
  checkStatus: RequestStatus;
  checkComment: string;
  createdAt: string;
  message: string | null;
};

export interface RequestResponseForm {
  checkStatus: RequestResponseStatus;
  checkComment: string;
}

export type RequestList = (Pick<Request, 'id' | 'createdAt' | 'message'> &
  Pick<Routine, 'routineName' | 'nickname' | 'mateNickname'>)[];
