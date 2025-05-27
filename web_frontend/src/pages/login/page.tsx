import { LoginForm } from '@/features';
import { styled } from '@stitches/react';
import { useNavigate } from 'react-router-dom';
import { loginFx } from '@/features/login-form/model';
import { useEffect } from 'react';

export const LoginPage = () => {
  const navigate = useNavigate();

  // Перенаправляем после успешного логина
  useEffect(() => {
    const unwatch = loginFx.done.watch(() => {
      navigate('/equipment');
    });

    return () => {
      unwatch();
    };
  }, [navigate]);

  return (
    <Main>
      <LoginForm />
    </Main>
  );
};
const Main = styled('main', {
  background: 'linear-gradient(135deg, #2563eb 0%, #059669 100%)',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
