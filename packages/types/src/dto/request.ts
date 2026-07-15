import { RequestResponseForm } from '../models/request';

interface CreateRequestDto {
  routineId: number;
}

export type CreateRequestWebDto = CreateRequestDto & {
  image: string;
};

export type CreateRequestAppDto = CreateRequestDto & {
  images: {
    uri: string;
    name: string;
    type: 'image/jpeg';
  }[];
};

export type CreateRequestResponseDto = RequestResponseForm & {
  confirmId: number;
};
