// src/pages/help/faq.tsx
import React, { useState } from 'react';
import { styled } from '@stitches/react';

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: 'Как зарегистрироваться на сайте?',
    answer: 'Чтобы зарегистрироваться, нажмите на кнопку "Регистрация" в правом верхнем углу страницы и следуйте инструкциям.',
  },
  {
    question: 'Как восстановить пароль?',
    answer: 'Если вы забыли пароль, перейдите по ссылке "Забыли пароль?" на странице входа и следуйте инструкциям для восстановления.',
  },
  {
    question: 'Как обратиться в службу поддержки?',
    answer: 'Вы можете обратиться в службу поддержки через форму обратной связи на странице "Поддержка" или по электронной почте support@example.com.',
  },
];

export const FAQPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAnswer = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <Container>
      <Title>Часто задаваемые вопросы (FAQ)</Title>
      <Description>
        Здесь вы найдете ответы на самые популярные вопросы о работе нашего сайта. Нажмите на интересующий вас вопрос, чтобы увидеть ответ.
      </Description>
      <FAQList>
        {faqData.map((faq, index) => (
          <FAQItem key={index}>
            <Question onClick={() => toggleAnswer(index)}>
              {faq.question}
            </Question>
            {activeIndex === index && <Answer>{faq.answer}</Answer>}
          </FAQItem>
        ))}
      </FAQList>
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

const FAQList = styled('div', {
  textAlign: 'left',
});

const FAQItem = styled('div', {
  marginBottom: '20px',
});

const Question = styled('div', {
  fontSize: '18px',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#007BFF',
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

const Answer = styled('div', {
  fontSize: '16px',
  color: '#555',
  marginTop: '10px',
  paddingLeft: '10px',
});
