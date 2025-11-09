import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useLoginMutation } from '@repo/shared/hooks/useAuth';
import { AuthForm as AuthFormType } from '@repo/types';

import { setAuthorization } from '@/api';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/utils/error-utils';

import Button from '../common/button/Button';
import Input from '../common/input/Input';
import PasswordInput from '../common/input/PasswordInput';
import ToastContainer from '../common/ToastContainer';

import AuthForm from './AuthForm';

const LoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthFormType>({
    userId: '',
    password: '',
  });
  const login = useLoginMutation();
  const { toasts, error, removeToast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = form.userId && form.password;

    if (!isValid) {
      error('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await login.mutateAsync(form);

      setAuthorization(response.accessToken);
      navigate('/');
    } catch (err) {
      const errorMessage = getApiErrorMessage(
        err,
        '로그인에 실패했습니다. 다시 시도해주세요.',
      );

      error(errorMessage);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <>
      <AuthForm title="로그인" onSubmit={handleSubmit}>
        <div className='w-full flex flex-col gap-4'>
          <Input
            className="w-full h-13"
            name="userId"
            type="text"
            placeholder="아이디를 입력해주세요"
            value={form.userId}
            onChange={handleChange}
            required
          />
          <PasswordInput
            className="w-full h-13"
            name="password"
            placeholder="비밀번호를 입력해주세요"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button className="w-full h-13" type="submit">
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

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default LoginForm;
