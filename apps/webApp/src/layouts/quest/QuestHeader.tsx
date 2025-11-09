import Paragraph from '@/components/common/paragraph/Paragraph';

const QuestHeader = () => {
  return (
    <header className="relative flex w-full py-3 px-4 mt-4">
      <div className="w-full flex flex-col items-center">
        <Paragraph
          className="mb-2 text-shadow-[0_0_20px_rgba(176,176,176,0.6)]"
          variant="h2"
        >
          퀘스트 안내
        </Paragraph>
        <Paragraph color="oklch(60.9% 0.126 221.723)" variant="caption">
          Quest List
        </Paragraph>
      </div>
    </header>
  );
};

export default QuestHeader;
