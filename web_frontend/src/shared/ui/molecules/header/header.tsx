import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { useNavigate } from 'react-router-dom';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { $user, logout } from '@/shared/auth';

import { Location } from '../../atoms';

const roleName = (r: string) => {
  if (r === 'admin') return 'Администратор';
  if (r === 'operator') return 'Оператор';
  if (r === 'student') return 'Студент';
  return r;
};

export const Header = () => {
  const user = useUnit($user);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <StyledHeader>
      <Location />
      <UserSection>
        {user && (
          <>
            <UserInfo>
              <Text size="s" weight="bold">{user.full_name}</Text>
              <Text size="xs" view="secondary">{roleName(user.role)}</Text>
            </UserInfo>
            <Button label="Выход" size="xs" view="clear" onClick={handleLogout} />
          </>
        )}
      </UserSection>
    </StyledHeader>
  );
};

const StyledHeader = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
});

const UserSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const UserInfo = styled('div', {
  textAlign: 'right',
});
