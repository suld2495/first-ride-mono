import { Quest } from '@repo/types';
import { IconBriefcase, IconSquare } from '@tabler/icons-react';

import { COLOR } from '@/utils/color';

import Paragraph from '../common/paragraph/Paragraph';

import QuestTime from './QuestTime';

const QUEST_LABEL: Record<Quest['questType'], string> = {
  DAILY: '일일 퀘스트',
  WEEKLY: '주간 퀘스트',
};

const QuestItem = (quest: Quest & { onClick: (item: Quest) => void }) => {
  const { questType, questName, description, endDate, onClick } = quest;

  return (
    <div
      className={`
        relative bg-gradient-to-br from-slate-900/95 to-slate-800/95
        backdrop-blur-sm border-2 rounded-lg overflow-hidden
        transition-all duration-300 cursor-pointer
        border-primary-quest-border-color shadow-2xl shadow-cyan-500/30'}
      `}
      onClick={() => onClick(quest)}
    >
      <div className={`h-1 bg-gradient-to-r from-cyan-600 to-blue-800`} />

      <div className="p-4">
        <div className="mb-4">
          <div className={`text-sm font-bold mb-2`}>
            <Paragraph>[{QUEST_LABEL[questType]}]</Paragraph>
          </div>
          <Paragraph className="text-base mb-1 font-semibold">
            {questName}
          </Paragraph>
          <div className="mt-2">
            <Paragraph
              className="w-full text-center tracking-[6px] text-shadow-[0_0_30px_rgba(0,214,256,1)] mb-3"
              color={COLOR.quest.primaryText}
              variant="h2"
            >
              GOAL
            </Paragraph>
            <div className="flex gap-2 border-primary-quest-border-color border-[1px] p-3 rounded-sm">
              <IconSquare className="w-5 h-5 text-quest-title-color" />
              <Paragraph className="text-sm" color={COLOR.quest.grayText}>
                {description}
              </Paragraph>
            </div>
          </div>
        </div>
        <QuestTime endDate={new Date(endDate)} />
      </div>
    </div>
  );
};

interface QuestListProps {
  quests: Quest[];
  onClickItem: (item: Quest) => void;
}

const QuestList = ({ quests, onClickItem }: QuestListProps) => {
  return (
    <div className="px-4 pt-3 pb-10 flex-1 overflow-y-auto">
      {quests.length && (
        <div className="flex flex-col gap-4">
          {quests.map((quest) => (
            <QuestItem key={quest.questId} {...quest} onClick={onClickItem} />
          ))}
        </div>
      )}
      {quests.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="-mt-20 flex flex-col items-center justify-center gap-4">
            <IconBriefcase size={50} />
            <Paragraph>퀘스트가 존재하지 않습니다.</Paragraph>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestList;
