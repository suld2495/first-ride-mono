import axiosInstance from '@repo/shared/api';

export interface OnboardingStatus {
  onboardingRequired: boolean;
}

export async function fetchOnboardingStatus(): Promise<OnboardingStatus> {
  const { data } = await axiosInstance.get<
    OnboardingStatus | { data: OnboardingStatus }
  >('/users/me');
  const status = data && 'data' in data ? data.data : data;
  if (typeof status?.onboardingRequired !== 'boolean') {
    throw new Error('온보딩 필요 여부를 확인하지 못했어요.');
  }
  return status;
}

export async function markOnboardingSeen(): Promise<void> {
  await axiosInstance.post('/users/me/onboarding/seen');
}
