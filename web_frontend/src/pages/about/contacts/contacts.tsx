// src/pages/about/contacts.tsx
import React from 'react';
import { styled } from '@stitches/react';

export const ContactsPage: React.FC = () => {
  return (
    <Container>
      <Title>Контактная информация</Title>
      <Text>
        Мы всегда рады помочь вам и ответить на любые вопросы. Свяжитесь с нами любым удобным для вас способом:
      </Text>
      <ContactInfo>
        <ContactItem>
          <Label>Адрес:</Label> 123456, г. Москва, ул. Ленина, д. 10
        </ContactItem>
        <ContactItem>
          <Label>Телефон:</Label> +7 (800) 123-45-67
        </ContactItem>
        <ContactItem>
          <Label>Email:</Label> info@ourproject.com
        </ContactItem>
        <ContactItem>
          <Label>Рабочие часы:</Label> Понедельник - Пятница: 09:00 - 18:00
        </ContactItem>
      </ContactInfo>
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

const ContactInfo = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

const ContactItem = styled('div', {
  fontSize: '16px',
  color: '#555',
});

const Label = styled('span', {
  fontWeight: 'bold',
  color: '#333',
});
