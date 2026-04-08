import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';

import axiosInstance from '../../api';
import * as authApi from '../../api/auth.api';
import { useLogoutMutation } from '../useAuth';

let mockAxios: MockAdapter;
const LOGGED_OUT_SUCCESSFULLY_MESSAGE = { message: 'Logged out successfully' };
const LOGGED_OUT_LOCALLY_MESSAGE = { message: 'Logged out locally' };
const AUTH_LOGOUT_URL = '/auth/logout';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useAuth', () => {
  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('useLogoutMutation', () => {
    describe('성공 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_LOGOUT_URL).reply(200, {
          data: LOGGED_OUT_SUCCESSFULLY_MESSAGE,
        });
      });

      it('로그아웃 API를 호출한다', async () => {
        const logoutSpy = jest.spyOn(authApi, 'logout');

        const { result } = renderHook(() => useLogoutMutation(), {
          wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(logoutSpy).toHaveBeenCalled();
        expect(result.current.data).toEqual(LOGGED_OUT_SUCCESSFULLY_MESSAGE);

        logoutSpy.mockRestore();
      });
    });

    describe('실패 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_LOGOUT_URL).reply(500, {
          error: {
            message: 'Server error',
          },
        });
      });

      it('로컬 로그아웃 메시지를 반환한다', async () => {
        const { result } = renderHook(() => useLogoutMutation(), {
          wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(LOGGED_OUT_LOCALLY_MESSAGE);
      });
    });

    describe('네트워크 오류 발생 시', () => {
      beforeEach(() => {
        mockAxios.onPost(AUTH_LOGOUT_URL).networkError();
      });

      it('로컬 로그아웃 메시지를 반환한다', async () => {
        const { result } = renderHook(() => useLogoutMutation(), {
          wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(LOGGED_OUT_LOCALLY_MESSAGE);
      });
    });
  });
});
