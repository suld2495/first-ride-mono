import {
  IconCheck,
  IconSquare,
  IconSquareCheckFilled,
} from '@tabler/icons-react';

import { Routine } from '@/api/routine.api';
import { useWeeklyData } from '@/hooks/useRoutine';
import { getWeekMonday } from '@/utils/date-utils';

import IconButton from '../common/button/IconButton';
import Paragraph from '../common/paragraph/Paragraph';

interface RoutineHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const RoutineHeader = ({ className, children }: RoutineHeaderProps) => {
  return (
    <li
      className={`${className || ''} flex-1 text-sm py-2 flex justify-center dark:text-white`}
    >
      {children}
    </li>
  );
};

interface RoutineListProps {
  routines: Routine[];
  date: string;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}

export const RoutineWeekList = ({
  routines,
  date,
  onShowRequestModal,
  onShowDetailModal,
}: RoutineListProps) => {
  const weeklyData = useWeeklyData(routines);

  return routines.map(
    ({ routineId, routineName, weeklyCount = 0, routineCount }, i) => (
      <ul className="flex w-full text-center" key={routineId}>
        <li className="text-sm truncate py-2 px-1 w-[100px] text-[var(--primary-color)]">
          <Paragraph
            className="cursor-pointer hover:underline hover:text-gray-500"
            onClick={() => onShowDetailModal(routineId)}
          >
            {routineName}
          </Paragraph>
        </li>

        {weeklyData[i].map((check, index) => (
          <RoutineHeader className="text-[var(--primary-color)]" key={index}>
            {check ? (
              <IconSquareCheckFilled stroke={2} />
            ) : (
              <IconSquare stroke={2} />
            )}
          </RoutineHeader>
        ))}

        <RoutineHeader>
          <Paragraph
            variant="span"
            className="text-[var(--gray-main-color)] font-bold"
          >
            {Math.floor((~~weeklyCount / routineCount) * 100)}%
          </Paragraph>
        </RoutineHeader>
        <RoutineHeader>
          {date === getWeekMonday(new Date()) && (
            <IconButton
              className="px-2"
              icon={<IconCheck height={15} stroke={2} />}
              size="small"
              onClick={() => onShowRequestModal(routineId)}
            />
          )}
        </RoutineHeader>
      </ul>
    ),
  );
};

export const RoutineCountList = ({
  routines,
  date,
  onShowRequestModal,
  onShowDetailModal,
}: RoutineListProps) => {
  return routines.map(
    ({ routineId, routineName, weeklyCount = 0, routineCount }) => (
      <ul className="flex w-full text-center" key={routineId}>
        <li className="text-sm truncate py-2 px-1 w-[100px] text-[var(--primary-color)]">
          <Paragraph
            className="cursor-pointer hover:underline hover:text-gray-500"
            onClick={() => onShowDetailModal(routineId)}
          >
            {routineName}
          </Paragraph>
        </li>
        {Array(~~weeklyCount)
          .fill(0)
          .map((_, index) => (
            <RoutineHeader className="text-[var(--primary-color)]" key={index}>
              <IconSquareCheckFilled stroke={2} />
            </RoutineHeader>
          ))}

        {Array(Math.max(routineCount - ~~weeklyCount, 0))
          .fill(0)
          .map((_, index) => (
            <RoutineHeader key={index} className="text-gray-400">
              <IconSquare stroke={2} />
            </RoutineHeader>
          ))}

        {Array(7 - Math.max(routineCount, ~~weeklyCount))
          .fill(0)
          .map((_, index) => (
            <RoutineHeader key={index} className="text-gray-400">
              -
            </RoutineHeader>
          ))}

        <RoutineHeader>
          <Paragraph
            variant="span"
            className="text-[var(--gray-main-color)] font-bold"
          >
            {Math.floor((~~weeklyCount / routineCount) * 100)}%
          </Paragraph>
        </RoutineHeader>
        <RoutineHeader>
          {date === getWeekMonday(new Date()) && (
            <IconButton
              className="px-2"
              icon={<IconCheck height={15} stroke={2} />}
              size="small"
              onClick={() => onShowRequestModal(routineId)}
            />
          )}
        </RoutineHeader>
      </ul>
    ),
  );
};
