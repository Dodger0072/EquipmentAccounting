import { AsideList } from '@/shared/ui/molecules/aside-list';
import { Sidebar as ConstaSidebar } from '@consta/uikit/Sidebar';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { Header } from '.';
import { $isSidebarOpen } from '../model';

export const Sidebar = () => {
  const isSidebarOpen = useUnit($isSidebarOpen);

  return (
    <StyledSidebar isOpen={isSidebarOpen} position='left' hasOverlay={false}>
      <Header />
      <AsideList />
    </StyledSidebar>
  );
};

const StyledSidebar = styled(ConstaSidebar, {
  padding: '12px 0',
  backgroundColor: '#1E3A8A',
  color: '#FFFFFF',
});
