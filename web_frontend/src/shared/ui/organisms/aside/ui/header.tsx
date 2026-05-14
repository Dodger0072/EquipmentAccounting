import { IconHamburger } from '@consta/icons/IconHamburger';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { triggerSidebar } from '..';

export const Header = () => {
  const triggerSidebarEv = useUnit(triggerSidebar);

  return (
    <StyledHeader>
      <StyledIcon onClick={triggerSidebarEv} />
    </StyledHeader>
  );
};

const StyledHeader = styled('div', {
  padding: '16px',
  paddingInline: '32px',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: '8px',
});

const StyledIcon = styled(IconHamburger, {
  cursor: 'pointer',
  color: '#FFFFFF',
});
