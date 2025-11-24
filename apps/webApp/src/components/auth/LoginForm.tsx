import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLoginMutation } from '@repo/shared/hooks/useAuth';
import { AuthForm as AuthFormType } from '@repo/types';

import { setAuthorization } from '@/api';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

import Button from '../common/button/Button';
import Input from '../common/input/Input';
import PasswordInput from '../common/input/PasswordInput';

import AuthForm from './AuthForm';

const LoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthFormType>({
    userId: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const login = useLoginMutation();
  const { error } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = form.userId && form.password;

    if (!isValid) {
      error('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    try {
      const response = await login.mutateAsync(form);

      setAuthorization(response.accessToken);
      navigate('/');
    } catch (err) {
      const errors = getFieldErrors(err);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        const errorMessage = getApiErrorMessage(
          err,
          '로그인에 실패했습니다. 다시 시도해주세요.',
        );

        error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fieldName = event.target.name;

    setForm((prev) => ({
      ...prev,
      [fieldName]: event.target.value,
    }));

    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const { [fieldName]: _, ...rest } = prev;

        return rest;
      });
    }
  };

  return (
    <>
      <AuthForm title="로그인" onSubmit={handleSubmit}>
        <div className="w-full flex flex-col gap-4">
          <div>
            <Input
              className="w-full h-13"
              name="userId"
              type="text"
              placeholder="아이디를 입력해주세요"
              value={form.userId}
              onChange={handleChange}
              error={!!fieldErrors.userId}
              required
            />
            {fieldErrors.userId && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.userId}</p>
            )}
          </div>
          <div>
            <PasswordInput
              className="w-full h-13"
              name="password"
              placeholder="비밀번호를 입력해주세요"
              value={form.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              required
            />
            {fieldErrors.password && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>
          <Button className="w-full h-13" type="submit" loading={isLoading}>
            로그인
          </Button>
        </div>
        <Link
          className="w-full dark:text-white text-sm mt-2 text-right"
          to="/join"
        >
          회원가입
        </Link>
      </AuthForm>
    </>
  );
};

export default LoginForm;
