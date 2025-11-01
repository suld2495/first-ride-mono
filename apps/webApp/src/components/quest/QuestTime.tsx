import { COLOR } from "@/utils/color";
import { formatTimeRemaining } from "@repo/shared/utils/date-utils";
import { IconClockHour4 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Paragraph from "../common/paragraph/Paragraph";

interface QuestTimeProps {
  endDate: Date;
}

const QuestTime = ({ endDate }: QuestTimeProps) => {
  const [timeRemaining, setTimeRemaining] = useState("D-0");

  useEffect(() => {
    let start = 0;
    const timer = (time: number) => {
      if (!start) {
        start = time;
      }

      if (time - start >= 1000) {
        start = time;
        setTimeRemaining(formatTimeRemaining(new Date(), endDate))
      }

      rAF = requestAnimationFrame(timer);
    };

    let rAF = requestAnimationFrame(timer);

    return () => {
      cancelAnimationFrame(rAF);
    }
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 border-primary-quest-border-color border-[1px] py-2 rounded-sm">
      <IconClockHour4 color={COLOR.quest.primaryText} stroke={2} size={20} />
      <Paragraph color={COLOR.quest.primaryText}>
        {timeRemaining}
      </Paragraph>
    </div>
  )
};

export default QuestTime;