import { styled } from '@stitches/react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export type DropdownLinkProps = {
  text: string;
  children: Array<{
    to: string;
    text: string;
  }>;
};

export const DropdownLink = ({ text, children }: DropdownLinkProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = children.some(child => child.to === location.pathname);

  return (
    <DropdownContainer>
      <StyledLink 
        onClick={() => setIsOpen(!isOpen)}
        type={isActive ? 'active' : undefined}
      >
        {text}
        <ChevronIcon isOpen={isOpen}>▼</ChevronIcon>
      </StyledLink>
      
      <SubMenuContainer isOpen={isOpen}>
        {children.map((child) => (
          <SubMenuItem key={child.to}>
            <StyledNavLink 
              to={child.to}
              type={child.to === location.pathname ? 'active' : undefined}
            >
              {child.text}
            </StyledNavLink>
          </SubMenuItem>
        ))}
      </SubMenuContainer>
    </DropdownContainer>
  );
};

const DropdownContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const StyledLink = styled('div', {
  padding: '8px 32px',
  color: '#FFFFFF',
  textDecoration: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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

const ChevronIcon = styled('span', {
  transform: 'rotate(0deg)',
  transition: 'transform 0.2s ease',
  fontSize: '12px',
  variants: {
    isOpen: {
      true: {
        transform: 'rotate(180deg)',
      },
    },
  },
});

const SubMenuContainer = styled('div', {
  maxHeight: '0',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease',
  variants: {
    isOpen: {
      true: {
        maxHeight: '200px', // Достаточно для 2-3 пунктов
      },
    },
  },
});

const SubMenuItem = styled('div', {
  // Контейнер для подпунктов
});

const StyledNavLink = styled(NavLink, {
  display: 'block',
  padding: '6px 48px', // Меньше отступы для подпунктов
  color: '#FFFFFF',
  textDecoration: 'none',
  fontSize: '14px', // Меньший шрифт для подпунктов
  opacity: '0.9',
  variants: {
    type: {
      active: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        opacity: '1',
      },
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: '1',
  },
});

