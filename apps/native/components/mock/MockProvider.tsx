// import { makeServer } from '@/mock/server';
import { useEffect } from 'react';

const MockProvider = () => {
  useEffect(() => {
    if (!process.env.EXPO_PUBLIC_VITE_BASE_URL) {
      // makeServer();
    }
  }, []);

  return null;
};

export default MockProvider;
