// src/pages/help/help.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@stitches/react';
import { Outlet } from 'react-router-dom';

export const HelpPage: React.FC = () => {
  return (
    <Container>
      <Title>Помощь</Title>
      <Text>
        Добро пожаловать в раздел помощи! Здесь вы найдете ответы на часто задаваемые вопросы и информацию о том, как получить поддержку. Выберите один из разделов ниже, чтобы узнать больше.
      </Text>
      <LinkContainer>
        <StyledLink to="/help/faq">Часто задаваемые вопросы (FAQ)</StyledLink>
        <StyledLink to="/help/support">Поддержка</StyledLink>
      </LinkContainer>
      <Outlet/>
    </Container>
  );
};

// Стили для компонента
const Container = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
});

const Title = styled('h2', {
  fontSize: '24px',
  marginBottom: '20px',
  color: '#333',
});

const Text = styled('p', {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#555',
  marginBottom: '20px',
});

const LinkContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

const StyledLink = styled(Link, {
  fontSize: '16px',
  color: '#007BFF',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
});
