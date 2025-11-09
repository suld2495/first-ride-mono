import { Routine, WeeklyRoutine } from '@repo/types';
import {
  IconSquare,
  IconSquareCheckFilled,
  IconCircleCheckFilled,
} from '@tabler/icons-react';

import { useWeeklyData } from '@repo/shared/hooks/useRoutine';
import { getDaysOfTheWeek, getWeekMonday } from '@repo/shared/utils';

import IconButton from '../common/button/IconButton';
import Paragraph from '../common/paragraph/Paragraph';
import React from 'react';

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

const checkPointColor = '#00ffdd';

interface RoutineListProps {
  date: string;
  onShowRequestModal: (id: number) => void;
  onShowDetailModal: (id: number) => void;
}

type RoutineWrapperProps = RoutineListProps & {
  routines: WeeklyRoutine[] | Routine[];
  render: (routine: WeeklyRoutine | Routine) => React.ReactNode;
}

const RoutineWrapper = ({ routines, date, onShowRequestModal, onShowDetailModal, render }: RoutineWrapperProps) => {
  return routines.map(
    (routine) => (
      <div key={routine.routineId} className='mt-10'>
        <div className='flex justify-between my-4'>
          <Paragraph 
            className='flex items-center cursor-pointer hover:underline hover:text-gray-500'
            onClick={() => onShowDetailModal(routine.routineId)}
          >
            {routine.routineName}
          </Paragraph>
          <div>
            {date === getWeekMonday(new Date()) && (
              <IconButton
                className="px-2"
                icon={<IconCircleCheckFilled height={15} stroke={2} />}
                size="small"
                onClick={() => onShowRequestModal(routine.routineId)}
              >
                인증요청
              </IconButton>
            )}
          </div>
        </div>
        <div className='bg-primary-color-light dark:bg-dark-primary-color-bold py-4 rounded-xl px-6 text-primary-light-text-color'>
            {render(routine)}
        </div>
      </div>
    ),
  );
};

export const RoutineWeekList = (props: RoutineListProps & { routines: WeeklyRoutine[] }) => {
  const { routines } = props;
  const weeklyData = useWeeklyData(routines);

  return (
    <RoutineWrapper
      {...props}
      render={({ routineId, weeklyCount, routineCount }) => {
        let count = 0;

        return (
          <>
            <ul className='flex w-full text-center pb-2 border-b-1 border-b-white'>
              {getDaysOfTheWeek().map((day) => (
                <li key={day} className="text-sm truncate py-2 px-1 w-1/8 text-[var(--primary-color)]">
                  <Paragraph>{day}</Paragraph>
                </li>
              ))}
              <li className='flex justify-center items-center w-1/8 dark:text-white'>
                <IconCircleCheckFilled height={24} stroke={2} />
              </li>
            </ul>
            <ul className="flex w-full text-center pt-2" key={routineId}>
              {weeklyData[routineId].map((check, index) => {
                count += +check;
  
                return (
                  <RoutineHeader className="text-[var(--primary-color)]" key={index}>
                    {check ? (
                      <IconSquareCheckFilled stroke={2} color={count <= routineCount ? undefined : checkPointColor} />
                    ) : (
                      <IconSquare stroke={2} />
                    )}
                  </RoutineHeader>
                )
              })}
  
              <RoutineHeader>
                {~~weeklyCount >= routineCount ? (
                  <IconCircleCheckFilled height={24} stroke={2} />
                ) : (
                  <Paragraph
                    variant="span"
                    className="text-[var(--gray-main-color)] font-bold"
                  >
                    {Math.floor((~~weeklyCount / routineCount) * 100)}%
                  </Paragraph>
                )}
              </RoutineHeader>
            </ul>
          </>
        )
      }}
    />
  )
};

export const RoutineCountList = (props: RoutineListProps & { routines: Routine[] }) => {
  return (
    <RoutineWrapper
      {...props}
      render={({ routineId, weeklyCount, routineCount }) => (
        <>
          <ul className='flex w-full text-center pb-2 border-b-1 border-b-white'>
            {Array.from({ length: 7 }, (_, i) => i + 1).map((count, i) => (
              <li key={i} className="text-sm truncate py-2 px-1 w-1/8 text-[var(--primary-color)]">
                <Paragraph>{count}회</Paragraph>
              </li>
            ))}
            <li className='flex justify-center items-center w-1/8 dark:text-white'>
              <IconCircleCheckFilled height={24} stroke={2} />
            </li>
          </ul>
          <ul className="flex w-full text-center pt-2" key={routineId}>
            {Array(Math.min(~~weeklyCount, routineCount))
              .fill(0)
              .map((_, index) => (
                <RoutineHeader className="text-[var(--primary-color)]" key={index}>
                  <IconSquareCheckFilled stroke={2} />
                </RoutineHeader>
              ))}

            {Array(Math.max(~~weeklyCount - routineCount, 0))
              .fill(0)
              .map((_, index) => (
                <RoutineHeader className="text-[var(--primary-color)]" key={index}>
                  <IconSquareCheckFilled stroke={2} color={checkPointColor} />
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
              {~~weeklyCount >= routineCount ? (
                <IconCircleCheckFilled height={24} stroke={2} />
              ) : (
                <Paragraph
                  variant="span"
                  className="text-[var(--gray-main-color)] font-bold"
                >
                  {Math.floor((~~weeklyCount / routineCount) * 100)}%
                </Paragraph>
              )}
            </RoutineHeader>
          </ul>
        </>
      )}
    />
  );
};
