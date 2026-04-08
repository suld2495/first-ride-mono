import { useAuthStore } from '@/store/auth.store';

export const useAuthUser = () => useAuthStore((state) => state.user);

export const useAuthIsLoading = () => useAuthStore((state) => state.isLoading);

export const useAuthSignIn = () => useAuthStore((state) => state.signIn);

export const useAuthSignOut = () => useAuthStore((state) => state.signOut);
