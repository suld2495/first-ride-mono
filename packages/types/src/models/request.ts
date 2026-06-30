import { Routine } from './routine';

export type RequestResponseStatus = 'DENY' | 'PASS';
export type RequestStatus = 'WAIT' | RequestResponseStatus;

export type Request = {
  id: number;
  image: string;
  checkStatus: RequestStatus;
  checkComment: string;
  createdAt: string;
};

export interface RequestResponseForm {
  checkStatus: RequestResponseStatus;
  checkComment: string;
}

export type RequestList = (Pick<Request, 'id' | 'createdAt'> &
  Pick<Routine, 'routineName' | 'nickname' | 'mateNickname'>)[];
