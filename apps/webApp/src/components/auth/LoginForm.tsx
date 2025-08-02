import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import Button from '../common/button/Button';
import Input from '../common/input/Input';
import AuthForm from './AuthForm';
import { AuthForm as AuthFormType } from '@repo/types';
import { useLoginMutation } from '@repo/shared/hooks/useAuth';
import { setAuthorization } from '@/api';

const LoginForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthFormType>({
    email: '',
    password: '',
  });
  const login = useLoginMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = form.email && form.password;

    if (!isValid) {
      alert('아이디 또는 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await login.mutateAsync(form);
      setAuthorization(response.token);
      navigate('/routine');
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
      title='로그인'
      onSubmit={handleSubmit}
    >
      <Input
        className="w-full h-13 mb-4"
        name="email"
        type="text"
        placeholder="아이디를 입력해주세요"
        value={form.email}
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
      <Button 
        className='w-full h-13' 
        type="submit"
      >
        로그인
      </Button>
      <Link className='w-full dark:text-white text-sm mt-2 text-right' to="/join">회원가입</Link>
    </AuthForm>
  );
};

export default LoginForm;
