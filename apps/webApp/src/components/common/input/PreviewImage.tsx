import { useMemo, useState } from 'react';
import { IconPhotoScan } from '@tabler/icons-react';

import { toPxels } from '@/utils/css-utils';

import Paragraph from '../paragraph/Paragraph';
import Skeleton from '../skelton/Skeleton';

interface PreviewImageProps {
  className?: string;
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  defaultImage?: string;
}

const PreviewImage = ({
  className,
  src,
  alt,
  width = '100%',
  height = '100%',
  defaultImage,
}: PreviewImageProps) => {
  const [show, setShow] = useState(true);
  const [error, setError] = useState(false);
  const style = useMemo(() => {
    return {
      width: toPxels(width),
      height: toPxels(height),
    };
  }, [width, height]);

  const handleError = () => {
    setError(true);
    setShow(false);
  };

  return (
    <div className="relative w-full h-full" style={style} aria-busy={show}>
      {!error ? (
        <img
          className={`w-full h-full rounded-lg object-contain ${className} ${show ? 'hidden' : ''}`}
          src={src}
          alt={alt || '이미지 미리보기'}
          onLoad={() => setShow(false)}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full">
          <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg text-gray-400">
            {defaultImage ? (
              <img
                className="w-full h-full rounded-lg object-contain"
                src={defaultImage}
                alt="이미지가 존재하지 않습니다."
              />
            ) : (
              <IconPhotoScan
                width={parseInt(style.width, 10) / 3}
                height={parseInt(style.height, 10) / 3}
                stroke={2}
              />
            )}
          </div>
          <Paragraph className="mt-2">이미지가 존재하지 않습니다.</Paragraph>
        </div>
      )}
      <Skeleton
        className="absolute top-0 left-0 rounded-2xl"
        show={show}
        width={style.width}
        height={style.height}
      />
    </div>
  );
};

export default PreviewImage;
