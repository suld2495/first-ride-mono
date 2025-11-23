import {
  useAccpetQuestMutation,
  useFetchQuestDetailQuery,
} from '@repo/shared/hooks/useQuest';
import { Quest } from '@repo/types';
import { IconBolt, IconSquare } from '@tabler/icons-react';

import { useToast } from '@/hooks/useToast';
import { useQuestStore } from '@/store/quest.store';
import { COLOR } from '@/utils/color';
import { getApiErrorMessage } from '@/utils/error-utils';

import Button from '../common/button/Button';
import Paragraph from '../common/paragraph/Paragraph';
import QuestInfo from '../quest/QuestInfo';
import QuestRewards from '../quest/QuestRewards';
import QuestTime from '../quest/QuestTime';

const QUEST_LABEL: Record<Quest['questType'], string> = {
  DAILY: '일일 퀘스트',
  WEEKLY: '주간 퀘스트',
};

const QuestDetailModal = () => {
  const questId = useQuestStore((state) => state.questId);
  const { data: detail, isLoading } = useFetchQuestDetailQuery(questId);
  const acceptQuest = useAccpetQuestMutation();
  const { success, error } = useToast();

  if (isLoading || !detail) {
    return null;
  }

  const {
    questType,
    questName,
    description,
    endDate,
    currentParticipants,
    maxParticipants,
    isAccepted,
  } = detail;

  const handleAccpet = async () => {
    try {
      await acceptQuest.mutateAsync(detail.questId);
      success('수락되었습니다.');
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '퀘스트 수락에 실패했습니다. 다시 시도해주세요.',
      );

      error(errorMessage);
    }
  };

  return (
    <>
      <div className="bg-primary-light-text-color rounded-b-md">
        <div className="flex flex-col gap-3 p-4">
        <div>
          <div className={`text-sm font-bold mb-2`} color="">
            <Paragraph>[{QUEST_LABEL[questType]}]</Paragraph>
          </div>
          <Paragraph className="text-base mb-1 font-semibold">
            {questName}
          </Paragraph>
          <div className="mt-2">
            <Paragraph
              className="w-full text-center tracking-[6px] [text-shadow:0_0_30px_rgba(0,214,256,1)] mb-3"
              style={{ color: '#1ddeff' }}
              variant="title"
            >
              GOAL
            </Paragraph>
            <div className="flex gap-2 border-primary-quest-border-color border-[1px] p-3 rounded-sm">
              <IconSquare className="w-5 h-5 text-cyan-600" />
              <Paragraph className="text-sm" style={{ color: '#90a1b9' }}>
                {description}
              </Paragraph>
            </div>
          </div>
        </div>
        <QuestInfo {...detail} />
        <QuestRewards {...detail} />
        <QuestTime endDate={new Date(endDate)} />
        <div className="flex gap-2 justify-end">
          {isAccepted && (
            <Button
              className="w-full flex gap-2 justify-center opacity-35 cursor-not-allowed"
              style={{ backgroundColor: COLOR.quest.grayText }}
              disabled={true}
            >
              <IconBolt stroke={2} size={20} />
              참여중
            </Button>
          )}
          {!isAccepted && currentParticipants === maxParticipants && (
            <Button
              className="w-full flex gap-2 justify-center opacity-35 cursor-not-allowed"
              style={{ backgroundColor: COLOR.quest.grayText }}
              disabled={true}
            >
              <IconBolt stroke={2} size={20} />
              참여불가 (정원 초과)
            </Button>
          )}
          {!isAccepted && currentParticipants !== maxParticipants && (
            <Button
              className="w-full"
              style={{ backgroundColor: COLOR.quest.background }}
              onClick={handleAccpet}
            >
              참여
            </Button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default QuestDetailModal;
