import { useMutation } from '@tanstack/react-query';

import { createBetaFeedback } from '../api/beta-feedback.api';

export const useCreateBetaFeedbackMutation = () =>
  useMutation({
    mutationFn: createBetaFeedback,
  });
