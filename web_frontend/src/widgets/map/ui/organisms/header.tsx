import { styled } from '@stitches/react';

import { Categories, Place, ClassroomSelector } from '../atoms';

export const Header = () => {
  return (
    <Container>
      <LeftContainer>
        <Categories />
        <Place />
        <ClassroomSelector />
      </LeftContainer>
    </Container>
  );
};

const Container = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'end',
  width: '100%',
});

const LeftContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  width: '70%',
});
