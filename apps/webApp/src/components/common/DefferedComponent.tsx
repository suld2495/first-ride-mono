import { useEffect, useRef, useState } from 'react';

import { useAnimation } from '@/hooks/useAnimation';

interface DefferedComponentProps {
  show: boolean;
  animation?: boolean;
  children: React.ReactNode;
}

const DefferedComponent = ({
  children,
  show,
  animation = false,
}: DefferedComponentProps) => {
  const timer = useRef<number | null>(null);
  const [shouldRender, handleAnimationEnd, setRender] = useAnimation(show);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (timer.current) {
      timer.current = setTimeout(() => {
        setFadeIn(true);
      }, 200);
    }

    if (!animation && !show) {
      setRender(false);
    }

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [animation, setRender, show]);

  let showClass = 'block';
  let hideClass = 'hidden';

  if (animation) {
    showClass = 'fade-in';
    hideClass = 'fade-out';
  }

  return (
    shouldRender && (
      <div
        className={`${fadeIn ? '' : 'hidden'} ${fadeIn && show ? showClass : ''} ${show ? '' : hideClass}`}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </div>
    )
  );
};

export default DefferedComponent;
