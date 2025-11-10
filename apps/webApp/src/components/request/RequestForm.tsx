import { useState } from 'react';
import { ApiError } from '@repo/shared/api/AppError';
import { useCreateRequestMutation } from '@repo/shared/hooks/useRequest';
import { Routine } from '@repo/types';

import { useToast } from '@/hooks/useToast';
import { useModalStore } from '@/store/modal.store';
import { getApiErrorMessage } from '@/utils/error-utils';

import Button from '../common/button/Button';
import ImageUpload from '../common/input/ImageUpload';
import Label from '../common/input/Label';
import Paragraph from '../common/paragraph/Paragraph';

interface FormLabelProps {
  children: React.ReactNode;
}

const FormLabel = ({ children }: FormLabelProps) => {
  return (
    <Label htmlFor="name" className="text-[14px] dark:text-gray-300 font-bold">
      {children}
    </Label>
  );
};

interface RequestFormProps {
  routineId: Routine['routineId'];
  routineName: Routine['routineName'];
  routineDetail: Routine['routineDetail'];
  nickname: Routine['nickname'];
  mateNickname: Routine['mateNickname'];
  isMe: Routine['isMe'];
}

const RequestForm = ({
  routineId,
  routineName,
  routineDetail,
  nickname,
  mateNickname,
  isMe,
}: RequestFormProps) => {
  const closeModal = useModalStore((state) => state.close);
  const [image, setImage] = useState<File | null>(null);
  const enable = image !== null;
  const { success, error } = useToast();

  const saveRequest = useCreateRequestMutation();

  const handleFileUpload = (files: File[]) => {
    setImage(files[0]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!image) return;

    const formData = new FormData();

    formData.append('image', image);
    formData.append('routineId', routineId.toString());
    formData.append('nickname', nickname);

    try {
      await saveRequest.mutateAsync(formData);
      closeModal();

      if (isMe) {
        success('인증이 완료되었습니다.');
      } else {
        success('인증 요청이 완료되었습니다.');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 413) {
          error('용량은 1MB 이하만 업로드 가능합니다.');
          return;
        }
      }

      const errorMessage = getApiErrorMessage(
        err,
        '인증 요청에 실패했습니다. 다시 시도해주세요.',
      );

      error(errorMessage);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
      <input className="hidden" name="routineId" defaultValue={routineId} />
      <input className="hidden" name="nickname" defaultValue={nickname} />
      <div className="flex flex-col gap-2 mt-5">
        <FormLabel>루틴 이름</FormLabel>
        <Paragraph>{routineName}</Paragraph>
      </div>
      <div className="flex flex-col gap-2 mt-5">
        <FormLabel>루틴 설명</FormLabel>
        <Paragraph>{routineDetail}</Paragraph>
      </div>
      <div className="flex flex-col gap-2 mt-5">
        <FormLabel>메이트</FormLabel>
        <Paragraph>{!isMe ? mateNickname : '나'}</Paragraph>
      </div>
      <div className="flex flex-col gap-2 mt-5">
        <FormLabel>인증 사진</FormLabel>
        <div>
          <ImageUpload name="image" onChange={handleFileUpload} isPreview />
        </div>
      </div>
      <div className="flex justify-end mt-5">
        <Button className="mr-2" variant="plain" onClick={closeModal}>
          취소
        </Button>
        <Button
          type="submit"
          className="disabled:opacity-30 disabled:cursor-not-allowed"
          disabled={!enable}
        >
          요청
        </Button>
      </div>
      </form>
    </>
  );
};

export default RequestForm;
