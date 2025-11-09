import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useJoinMutation } from '@repo/shared/hooks/useAuth';
import { JoinForm as JoinFormType } from '@repo/types';

import Button from '../common/button/Button';
import Input from '../common/input/Input';
import PasswordInput from '../common/input/PasswordInput';

import AuthForm from './AuthForm';
import { ApiError } from '@repo/shared/api/AppError';

const JoinForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<
    JoinFormType & { passwordConfirm: JoinFormType['password'] }
  >({
    userId: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    job: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const join = useJoinMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = form.userId && form.nickname && form.password;

    if (!isValid) {
      alert('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    if (form.passwordConfirm !== form.password) {
      alert('비밀번호가 다릅니다.');
      return;
    }

    setIsLoading(true);
    try {
      await join.mutateAsync(form);
      alert('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (error) {
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : '회원가입에 실패했습니다. 다시 시도해주세요.';

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <AuthForm title="회원가입" onSubmit={handleSubmit}>
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
        <Input
          className="w-full h-13"
          name="nickname"
          type="text"
          placeholder="닉네임을 입력해주세요"
          value={form.nickname}
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
        <PasswordInput
          className="w-full h-13"
          name="passwordConfirm"
          placeholder="비밀번호를 다시 입력해주세요"
          value={form.passwordConfirm}
          onChange={handleChange}
          required
        />
        <Input
          className="w-full h-13"
          name="job"
          type="text"
          placeholder="직업을 입력해주세요"
          value={form.job}
          onChange={handleChange}
        />
        <Button className="w-full h-13" type="submit" loading={isLoading}>
          회원가입
        </Button>
      </div>
      <Link
        className="w-full dark:text-white text-sm mt-2 text-right"
        to="/login"
      >
        로그인
      </Link>
    </AuthForm>
  );
};

export default JoinForm;
