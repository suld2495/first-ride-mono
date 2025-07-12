import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuthStore } from '@repo/shared/store/auth.store';

import Button from '../common/button/Button';
import Input from '../common/input/Input';

const AuthForm = () => {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    signIn({ name: nickname });

    navigate('/routine');
  };

  return (
    <form
      className="flex flex-col items-center justify-center h-screen"
      onSubmit={handleSubmit}
    >
      <Input
        className="mb-4"
        name="nickname"
        type="text"
        placeholder="값을 입력하세요"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
      />
      <Button type="submit">로그인</Button>
    </form>
  );
};

export default AuthForm;
