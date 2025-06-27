import { useMemo } from 'react';

import { useAnimation } from '@/hooks/useAnimation';
import { toPxels } from '@/utils/css-utils';

type SkeletonVariants = 'pulse';

interface SkeltonProps {
  show: boolean;
  variant?: SkeletonVariants;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const variantStyles: Record<SkeletonVariants, string> = {
  pulse: 'w-full h-full animate-pulse bg-gray-200',
};

const Skeleton = ({
  show,
  variant = 'pulse',
  width = '100%',
  height = '100%',
  className = '',
}: SkeltonProps) => {
  const [shouldRender, handleAnimationEnd] = useAnimation(show);

  const style = useMemo(() => {
    return {
      width: toPxels(width),
      height: toPxels(height),
    };
  }, [width, height]);

  return (
    shouldRender && (
      <div
        className={`overflow-hidden ${show ? 'fade-in' : 'fade-out'} ${className}`}
        style={style}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={`${variantStyles[variant]}`} />
      </div>
    )
  );
};

export default Skeleton;
