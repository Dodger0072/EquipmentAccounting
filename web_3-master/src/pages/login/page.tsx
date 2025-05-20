import { LoginForm } from '@/features';
import { styled } from '@stitches/react';

export const LoginPage = () => {
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
