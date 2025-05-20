// src/pages/help/support.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { styled } from '@stitches/react';

export const SupportPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResponseMessage('');

    try {
    //   const response = await axios.post('http://localhost:8080/support', {
    //     name,
    //     email,
    //     message,
    //   });

    //   if (response.status === 200) {
    //     setResponseMessage('Ваше сообщение успешно отправлено!');
    //     setName('');
    //     setEmail('');
    //     setMessage('');
    //   }
    } catch (err) {
      setError('Ошибка при отправке сообщения. Попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>Служба поддержки</Title>
      <Description>
        Если у вас возникли вопросы или проблемы, свяжитесь с нами через форму ниже, и мы постараемся помочь вам как можно скорее.
      </Description>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextArea
          placeholder="Ваше сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Отправка...' : 'Отправить'}
        </Button>
        {responseMessage && <SuccessMessage>{responseMessage}</SuccessMessage>}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Form>
    </Container>
  );
};

// Стили для компонента
const Container = styled('div', {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
  textAlign: 'center',
});

const Title = styled('h2', {
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '20px',
  color: '#333',
});

const Description = styled('p', {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#555',
  marginBottom: '30px',
});

const Form = styled('form', {
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
});

const Input = styled('input', {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  '&:focus': {
    outline: 'none',
    borderColor: '#007BFF',
  },
});
const Button = styled('button', {
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: '#007BFF',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:disabled': {
        backgroundColor: '#aaa',
        cursor: 'not-allowed',
    },
    '&:hover:not(:disabled)': {
        backgroundColor: '#0056b3',
    },
});

const TextArea = styled('textarea', {
  padding: '10px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  resize: 'vertical',
  minHeight: '120px',
  '&:focus': {
    outline: 'none',
    borderColor: '#007BFF',
  },
});



const SuccessMessage = styled('p', {
  color: '#28a745',
  fontWeight: 'bold',
  marginTop: '10px',
});

const ErrorMessage = styled('p', {
  color: '#dc3545',
  fontWeight: 'bold',
  marginTop: '10px',
});
