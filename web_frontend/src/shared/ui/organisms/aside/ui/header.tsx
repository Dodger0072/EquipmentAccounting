import { IconHamburger } from '@consta/icons/IconHamburger';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { triggerSidebar } from '..';

export const Header = () => {
  const triggerSidebarEv = useUnit(triggerSidebar);

  return (
    <StyledHeader>
      <Text size='xl'>Admin.</Text>
      <StyledIcon onClick={triggerSidebarEv} />
    </StyledHeader>
  );
};

const StyledHeader = styled('div', {
  padding: '16px',
  paddingInline: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'end',
  marginBottom: '8px',
});

const StyledIcon = styled(IconHamburger, {
  cursor: 'pointer',
  color: '#FFFFFF',
});
