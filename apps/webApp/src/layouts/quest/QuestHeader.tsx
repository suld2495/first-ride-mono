import Paragraph from "@/components/common/paragraph/Paragraph";
import { IconExclamationMark } from "@tabler/icons-react";

const QuestHeader = () => {
  return (
    <header className="relative flex w-full py-3 px-4 mt-4">
      <div className="w-full flex flex-col items-center">
        <div className="bg-cyan-700/20 border-cyan-600 border-2 rounded-full p-1 mb-3">
          <IconExclamationMark stroke={2} size={30} color="red" />
        </div>
        <Paragraph 
          className="mb-2 text-shadow-[0_0_20px_rgba(176,176,176,0.6)]"
          variant="h2"
        >
          퀘스트 안내
        </Paragraph>
        <Paragraph 
          color="oklch(60.9% 0.126 221.723)"
          variant="caption"
        >
          Quest List
        </Paragraph>
      </div>
    </header>
  )
};

export default QuestHeader;