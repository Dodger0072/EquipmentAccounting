import { styled } from '@stitches/react';
import { NavLink, useLocation } from 'react-router-dom';

export type LinkProps = {
  to: string;
  text?: string;
};

export const Link = ({ to, text }: LinkProps) => {
  const location = useLocation();

  return (
    <StyledLink to={to} type={to === location.pathname ? 'active' : undefined}>
      {text}
    </StyledLink>
  );
};

const StyledLink = styled(NavLink, {
  padding: '8px 32px',
  color: '#FFFFFF',
  textDecoration: 'none',
  variants: {
    type: {
      active: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
