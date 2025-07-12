import { RequestResponseForm } from 'src/models/request';

interface CreateRequestDto {
  routineId: number;
  nickname: string;
}

export type CreateRequestWebDto = CreateRequestDto & {
  image: string;
};

export type CreateRequestAppDto = CreateRequestDto & {
  base64image: string;
};

export type CreateRequestResponseDto = RequestResponseForm & {
  confirmId: number;
};
