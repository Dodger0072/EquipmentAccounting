import { Header, Map } from '@/widgets';
import { styled } from '@stitches/react';

export const MapPage = () => {
  return (
    <Container>
      <Header />
      <Map />
    </Container>
  );
};

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '128px',
});
