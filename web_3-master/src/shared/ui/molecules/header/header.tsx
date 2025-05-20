import { styled } from '@stitches/react';

import { Location } from '../../atoms';

export const Header = () => {
  return (
    <StyledHeader>
      <Location />
    </StyledHeader>
  );
};

const StyledHeader = styled('header', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px',
});
