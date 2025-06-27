import { useState } from 'react';

import { useCreateRequestMutation } from '@/hooks/useRequest';
import { useModalStore } from '@/store/modal.store';

import Button from '../common/button/Button';
import ImageUpload from '../common/input/ImageUpload';
import Paragraph from '../common/paragraph/Paragraph';
import Label from '../common/input/Label';

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
  routineId: number;
  routineName: string;
  routineDetail: string;
  nickname: string;
}

const RequestForm = ({
  routineId,
  routineName,
  routineDetail,
  nickname,
}: RequestFormProps) => {
  const closeModal = useModalStore((state) => state.close);
  const [image, setImage] = useState<File | null>(null);
  const enable = image !== null;

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
      alert('인증 요청이 완료되었습니다.');
    } catch {
      alert('인증 요청에 실패했습니다.');
    }
  };

  return (
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
  );
};

export default RequestForm;
