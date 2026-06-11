import { toAppError } from '.';
import http from './client';

export interface CreateInquiryRequest {
  recipientEmail: string;
  subject: string;
  replyEmail: string;
  title: string;
  content: string;
}

export const createInquiry = async (
  form: CreateInquiryRequest,
): Promise<void> => {
  try {
    await http.post('/inquiry', form);
  } catch (error) {
    throw toAppError(error);
  }
};
