import { Link } from 'react-router';
import {
  IconCategory,
  IconCategoryFilled,
  IconChevronLeft,
  IconChevronRight,
  IconSquareNumber7,
  IconSquareNumber7Filled,
} from '@tabler/icons-react';
import { useShallow } from 'zustand/shallow';

import { useRoutineStore } from '@/store/routine.store';
import {
  afterWeek,
  beforeWeek,
  getDisplayFormatDate,
  getWeekMonday,
  getWeekSunday,
} from '@/utils/date-utils';

interface RoutineDateProps {
  date?: string;
}

const RoutineDate = ({ date }: RoutineDateProps) => {
  const startDate = new Date(getWeekMonday(date ? new Date(date) : new Date()));
  const endDate = new Date(getWeekSunday(startDate));
  const [type, setType] = useRoutineStore(
    useShallow((state) => [state.type, state.setType]),
  );

  return (
    <div className="flex justify-between items-center mb-3 text-gray-main dark:text-white">
      <div className="text-sm">
        <span>{getDisplayFormatDate(startDate)}</span>
        <span className="mx-2">~</span>
        <span>{getDisplayFormatDate(endDate)}</span>
      </div>
      <div className="flex relative">
        <Link to={`/routine?date=${beforeWeek(startDate)}`}>
          <IconChevronLeft stroke={2} />
        </Link>
        <Link to={`/routine?date=${afterWeek(startDate)}`}>
          <IconChevronRight stroke={2} />
        </Link>
        <div className="flex ml-4 gap-1 items-center">
          <div className="absolute w-[2px] h-[15px] top-1/2 -translate-x-3 -translate-y-1/2 bg-gray-main dark:bg-[#9b9b9b]"></div>
          {type === 'number' ? (
            <>
              <IconSquareNumber7Filled
                className="cursor-pointer"
                size={20}
                onClick={() => setType('number')}
              />
              <IconCategory
                className="cursor-pointer"
                size={22}
                onClick={() => setType('week')}
              />
            </>
          ) : (
            <>
              <IconSquareNumber7
                className="cursor-pointer"
                size={20}
                onClick={() => setType('number')}
              />
              <IconCategoryFilled
                className="cursor-pointer"
                size={22}
                onClick={() => setType('week')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineDate;
