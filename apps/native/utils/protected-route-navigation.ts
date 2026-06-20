import type { Href } from 'expo-router';

interface RouterWithPush {
  push: (href: Href) => void;
}

export const pushAfterProtectedRoutesReady = (
  router: RouterWithPush,
  href: Href,
) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      router.push(href);
      resolve();
    }, 0);
  });
