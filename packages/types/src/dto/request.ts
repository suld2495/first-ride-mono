import { RequestResponseForm } from '../models/request';

interface CreateRequestDto {
  routineId: number;
  nickname: string;
}

export type CreateRequestWebDto = CreateRequestDto & {
  image: string;
};

export type CreateRequestAppDto = CreateRequestDto & {
  base64images: string[];
};

export type CreateRequestResponseDto = RequestResponseForm & {
  confirmId: number;
};
