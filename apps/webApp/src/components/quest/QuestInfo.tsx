import { Quest } from '@repo/types';
import { IconAlertTriangleFilled, IconBolt } from '@tabler/icons-react';

import { COLOR } from '@/utils/color';

import Paragraph from '../common/paragraph/Paragraph';

interface QuestBoxProps {
  title: string;
  children: React.ReactNode;
}

const QuestBox = ({ title, children }: QuestBoxProps) => {
  return (
    <div className="flex flex-col items-center justify-center flex-1 border-primary-quest-border-color border-[1px] rounded-[4px] py-3">
      <Paragraph
        className="mb-2"
        variant="caption"
        style={{ color: COLOR.quest.grayText }}
      >
        {title}
      </Paragraph>
      {children}
    </div>
  );
};

type QuestInfoProps = Pick<
  Quest,
  'requiredLevel' | 'currentParticipants' | 'maxParticipants'
>;

const QuestInfo = ({
  requiredLevel,
  currentParticipants,
  maxParticipants,
}: QuestInfoProps) => {
  return (
    <div className="border-primary-quest-border-color border-[1px] p-2 pb-3 rounded-md">
      <div className="flex items-center gap-1 mb-3">
        <IconBolt stroke={2} size={20} />
        <Paragraph className="font-bold" style={{ color: COLOR.quest.primaryText }}>
          QUEST INFO
        </Paragraph>
      </div>
      <div className="flex justify-between gap-2">
        <QuestBox title="최소 레벨">
          <Paragraph size="xl" weight="semibold" style={{ color: COLOR.quest.primaryText }}>
            {`LV.${requiredLevel}`}
          </Paragraph>
        </QuestBox>
        <QuestBox title="현재 인원">
          <Paragraph size="xl" weight="semibold" style={{ color: 'orange' }}>
            {currentParticipants}
            <Paragraph
              className="ml-2"
              style={{ color: COLOR.quest.grayText }}
              as="span" variant="label"
            >
              명
            </Paragraph>
          </Paragraph>
        </QuestBox>
        <QuestBox title="최대 인원">
          <Paragraph size="xl" weight="semibold" style={{ color: '#3a83ea' }}>
            {maxParticipants}
            <Paragraph
              className="ml-2"
              style={{ color: COLOR.quest.grayText }}
              as="span" variant="label"
            >
              명
            </Paragraph>
          </Paragraph>
        </QuestBox>
      </div>
      <div className="flex flex-col  gap-2 border-t-primary-quest-border-color border-t-[1px] mt-3 pt-2">
        <div className="flex justify-between">
          <Paragraph variant="caption" style={{ color: COLOR.quest.grayText }}>
            파티현황
          </Paragraph>
          <Paragraph variant="caption" style={{ color: COLOR.quest.grayText }}>
            {`${currentParticipants}/${maxParticipants}`}
          </Paragraph>
        </div>
        <progress
          className="progress w-full text-red-400"
          value={(currentParticipants / maxParticipants) * 100}
          max="100"
          style={{ color: 'red' }}
        />
        {currentParticipants === maxParticipants && (
          <Paragraph
            className="flex justify-center items-center gap-2"
            style={{ color: COLOR.quest.errorText }}
            variant="caption"
          >
            <IconAlertTriangleFilled stroke={2} size={17} color="yellow" />
            파티 인원이 가득 찼습니다.
          </Paragraph>
        )}
      </div>
    </div>
  );
};

export default QuestInfo;
