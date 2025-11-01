import { Routine } from './routine';

export type RequestResponseStatus = 'DENY' | 'PASS';
export type RequestStatus = 'DRAFT' | RequestResponseStatus;

export type Request = {
  id: number;
  image: string;
  checkStatus: RequestStatus;
  checkComment: string;
  createdAt: string;
};

export interface RequestResponseForm {
  checkStatus: RequestStatus;
  checkComment: string;
}

export type RequestList = (Pick<Request, 'id' | 'createdAt'> &
  Pick<Routine, 'routineName' | 'nickname' | 'mateNickname'>)[];
