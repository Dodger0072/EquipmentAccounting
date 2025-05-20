// src/pages/about/about.tsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { styled } from '@stitches/react';

export const AboutPage: React.FC = () => {
  return (

    <Container>
      <h1>О сайте</h1>
      <p>Этот сайт предоставляет информацию об оборудовании и его статусе.</p>
      <LinksContainer>
        <StyledLink to="/about/project">О проекте</StyledLink>
        <StyledLink to="/about/contacts">Контакты</StyledLink>
      </LinksContainer>
      <Outlet/>
    </Container>
  );
};

// Стили для компонента
const Container = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
  textAlign: 'center',
});

const LinksContainer = styled('div', {
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: '20px',
});

const StyledLink = styled(Link, {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '5px',
  transition: 'background-color 0.3s ease',

  '&:hover': {
    backgroundColor: '#0056b3',
  },
});
