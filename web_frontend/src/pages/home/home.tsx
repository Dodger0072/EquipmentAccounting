import { Header } from '@/shared/ui/molecules';
import { $isSidebarOpen, Aside } from '@/shared/ui/organisms';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Outlet } from 'react-router-dom';

export const HomePage = () => {
  const isSidebarOpen = useUnit($isSidebarOpen);

  return (
    <main>
      <Aside />
      <StyledContent state={isSidebarOpen ? 'open' : undefined}>
        <Header />
        <Container>
          <Outlet />
        </Container>
      </StyledContent>
    </main>
  );
};

const StyledContent = styled('div', {
  paddingTop: '16px',
  paddingLeft: '5rem',
  paddingRight: '16px',
  variants: {
    state: {
      open: {
        paddingLeft: '340px',
      },
    },
  },
});

const Container = styled('div', {
  padding: '16px',
});
