import { useState } from 'react';

import { CheckStatus, RoutineRequestDetail } from '@/api/request.api';
import { useReplyRequestMutation } from '@/hooks/useRequest';
import { useAuthStore } from '@/store/auth.store';
import { useModalStore } from '@/store/modal.store';

import Button from '../common/button/Button';
import Label from '../common/input/Label';
import Paragraph from '../common/paragraph/Paragraph';

const RequestView = ({
  id,
  routineName,
  routineDetail,
  imagePath,
}: RoutineRequestDetail) => {
  const user = useAuthStore((state) => state.user);
  const [comment, setComment] = useState('');
  const replyRequest = useReplyRequestMutation(user);
  const closeModal = useModalStore((state) => state.close);

  const handleSubmit = async (status: CheckStatus) => {
    try {
      await replyRequest.mutateAsync({
        confirmId: id,
        checkStatus: status,
        checkComment: comment,
      });

      closeModal();

      if (status === CheckStatus.PASS) {
        alert('승인되었습니다.');
      } else {
        alert('거절되었습니다.');
      }
    } catch {
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div>
      <div className="py-4">
        <Paragraph className="mb-2" variant="h4">
          {routineName}
        </Paragraph>
        <Paragraph>{routineDetail}</Paragraph>
      </div>
      <div className="py-5 border-t-[1px] border-gray-300">
        <Paragraph className="mb-2" variant="h4">
          인증 내용
        </Paragraph>
        <div className="relative w-full">
          <img src={imagePath} alt="인증" />
        </div>
      </div>
      <div className="mt-5 border-t-[1px] border-gray-300 py-4">
        <form>
          <input className="hidden" name="id" defaultValue={id} />

          <div>
            <Label htmlFor="comment" className="mb-2">
              응원의 한마디!
            </Label>
            <textarea
              id="comment"
              name="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full outline-none border-[1px] border-gray-300 rounded-md p-2 focus:border-gray-500 dark:focus:border-white focus:ring-0 transition-colors duration-300"
              placeholder="코멘트를 입력하세요."
            />
          </div>

          <div className="flex justify-end mt-2">
            <Button className="mr-2" variant="plain" onClick={closeModal}>
              취소
            </Button>
            <Button
              type="button"
              className="mr-2 px-4 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => handleSubmit(CheckStatus.PASS)}
            >
              승인
            </Button>
            <Button
              type="button"
              className="mr-2 px-4 bg-red-400 dark:bg-red-400 hover:bg-red-500 dark:hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => handleSubmit(CheckStatus.DENIED)}
            >
              거절
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestView;
