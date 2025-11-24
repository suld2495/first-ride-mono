import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useJoinMutation } from '@repo/shared/hooks/useAuth';
import { JoinForm as JoinFormType } from '@repo/types';

import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage, getFieldErrors } from '@/utils/error-utils';

import Button from '../common/button/Button';
import Input from '../common/input/Input';
import PasswordInput from '../common/input/PasswordInput';

import AuthForm from './AuthForm';

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const join = useJoinMutation();
  const { success, error } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = form.userId && form.nickname && form.password;

    if (!isValid) {
      error('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    if (form.passwordConfirm !== form.password) {
      error('비밀번호가 다릅니다.');
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    try {
      await join.mutateAsync(form);
      success('회원가입이 완료되었습니다.');
      navigate('/login');
    } catch (err) {
      const errors = getFieldErrors(err);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
      } else {
        const errorMessage = getApiErrorMessage(
          err,
          '회원가입에 실패했습니다. 다시 시도해주세요.',
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
      <AuthForm title="회원가입" onSubmit={handleSubmit}>
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
            <Input
              className="w-full h-13"
              name="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={form.nickname}
              onChange={handleChange}
              error={!!fieldErrors.nickname}
              required
            />
            {fieldErrors.nickname && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.nickname}
              </p>
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
          <div>
            <PasswordInput
              className="w-full h-13"
              name="passwordConfirm"
              placeholder="비밀번호를 다시 입력해주세요"
              value={form.passwordConfirm}
              onChange={handleChange}
              error={!!fieldErrors.passwordConfirm}
              required
            />
            {fieldErrors.passwordConfirm && (
              <p className="text-red-600 text-sm mt-1">
                {fieldErrors.passwordConfirm}
              </p>
            )}
          </div>
          <div>
            <Input
              className="w-full h-13"
              name="job"
              type="text"
              placeholder="직업을 입력해주세요"
              value={form.job}
              onChange={handleChange}
              error={!!fieldErrors.job}
            />
            {fieldErrors.job && (
              <p className="text-red-600 text-sm mt-1">{fieldErrors.job}</p>
            )}
          </div>
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
    </>
  );
};

export default JoinForm;
