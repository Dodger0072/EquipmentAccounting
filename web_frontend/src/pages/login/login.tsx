import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { TextField } from '@consta/uikit/TextField';
import { Button } from '@consta/uikit/Button';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { loginFx } from '@/shared/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  const pending = useUnit(loginFx.pending);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginFx({ username, password });
      navigate('/equipment', { replace: true });
    } catch {
      setError('\u041d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u043b\u043e\u0433\u0438\u043d \u0438\u043b\u0438 \u043f\u0430\u0440\u043e\u043b\u044c');
    }
  };

  return (
    <Wrapper>
      <Card>
        <Logo>
          <Text size="3xl" weight="bold" view="primary">
            {'\u0423\u0447\u0451\u0442 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f'}
          </Text>
          <Text size="s" view="secondary" style={{ marginTop: 4 }}>
            {'\u0412\u043e\u0439\u0434\u0438\u0442\u0435 \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0443 \u0434\u043b\u044f \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0435\u043d\u0438\u044f'}
          </Text>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <TextField
            label={'\u041b\u043e\u0433\u0438\u043d'}
            value={username}
            onChange={(value) => setUsername(value ?? '')}
            placeholder={'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043b\u043e\u0433\u0438\u043d'}
            size="l"
          />
          <TextField
            label={'\u041f\u0430\u0440\u043e\u043b\u044c'}
            value={password}
            onChange={(value) => setPassword(value ?? '')}
            placeholder={'\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u0430\u0440\u043e\u043b\u044c'}
            type="password"
            size="l"
          />

          {error && (
            <Text size="s" view="alert">
              {error}
            </Text>
          )}

          <Button
            label={pending ? '\u0412\u0445\u043e\u0434...' : '\u0412\u043e\u0439\u0442\u0438'}
            type="submit"
            size="l"
            view="primary"
            disabled={pending || !username || !password}
          />
        </Form>
      </Card>
    </Wrapper>
  );
};

const Wrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
});

const Card = styled('div', {
  background: '#fff',
  borderRadius: '16px',
  padding: '48px 40px',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
});

const Logo = styled('div', {
  textAlign: 'center',
  marginBottom: '32px',
});

const Form = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});
