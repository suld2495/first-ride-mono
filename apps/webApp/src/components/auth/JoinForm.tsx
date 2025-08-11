import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import Button from '../common/button/Button';
import Input from '../common/input/Input';
import AuthForm from './AuthForm';
import { JoinForm as JoinFormType } from '@repo/types';
import { useJoinMutation } from '@repo/shared/hooks/useAuth';

const JoinForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<JoinFormType & { passwordConfirm: JoinFormType['password'] }>({
    userId: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
  });
  const join = useJoinMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = form.userId && form.nickname && form.password;

    if (!isValid) {
      alert('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    if (form.passwordConfirm !== form.password) {
      alert("비밀번호가 다릅니다.");
      return;
    }

    try {
      await join.mutateAsync(form);
      navigate('/login');
    } catch {}
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <AuthForm 
      title='회원가입' 
      onSubmit={handleSubmit}
    >
      <Input
        className="w-full h-13 mb-4"
        name="userId"
        type="text"
        placeholder="아이디를 입력해주세요"
        value={form.userId}
        onChange={handleChange}
        required
      />
      <Input
        className="w-full h-13 mb-4"
        name="name"
        type="text"
        placeholder="닉네임을 입력해주세요"
        value={form.nickname}
        onChange={handleChange}
        required
      />
      <Input
        className="w-full h-13 mb-4"
        name="password"
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={form.password}
        onChange={handleChange}
        required
      />
      <Input
        className="w-full h-13 mb-4"
        name="passwordConfirm"
        type="password"
        placeholder="비밀번호를 다시 입력해주세요"
        value={form.password}
        onChange={handleChange}
        required
      />
      <Button 
        className='w-full h-13' 
        type="submit"
      >
        회원가입
      </Button>
      <Link className='w-full dark:text-white text-sm mt-2 text-right' to="/login">로그인</Link>
    </AuthForm>
  );
};

export default JoinForm;
