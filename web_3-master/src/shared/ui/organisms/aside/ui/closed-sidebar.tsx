import { IconKebab } from '@consta/icons/IconKebab';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { triggerSidebar } from '..';

export const ClosedSidebar = () => {
  const triggerSidebarEv = useUnit(triggerSidebar);

  return (
    <>
      <StyledAside>
        <StyledKebabIcon onClick={triggerSidebarEv} />
      </StyledAside>
    </>
  );
};

const StyledKebabIcon = styled(IconKebab, {
  cursor: 'pointer',
  color: '#FFFFFF',
});

const StyledAside = styled('aside', {
  width: '50px',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  backgroundColor: '#1E3A8A',
  display: 'flex',
  justifyContent: 'center',
  padding: '32px 4px',
});
