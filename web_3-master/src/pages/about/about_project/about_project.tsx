// src/pages/about/about-project.tsx
import React from 'react';
import { styled } from '@stitches/react';

export const AboutProjectPage: React.FC = () => {
  return (
    <Container>
      <Section>
        <Title>О проекте: История создания</Title>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Text>
      </Section>

      <Section>
        <Title>Цели и задачи проекта</Title>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ac diam nec nulla fermentum dapibus in nec justo. Phasellus auctor vel nunc non rhoncus. Maecenas sit amet libero eget lacus faucibus mollis at et nulla. Integer non nisi vitae risus lacinia suscipit. Nam volutpat urna ac odio lacinia, ut dictum libero vestibulum. Suspendisse potenti. Proin efficitur tortor nec libero aliquam, at tempus sapien ultricies. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In sodales quam ac ex pharetra, non placerat felis faucibus.
        </Text>
      </Section>

      <Section>
        <Title>Будущие планы развития</Title>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque viverra velit magna, eget pulvinar sapien laoreet a. Nunc ultrices metus ac eros lacinia bibendum. Quisque nec dapibus libero. Vivamus ut felis ut lacus tristique tristique. Aenean ac felis sit amet eros tincidunt commodo. Donec sit amet felis at magna pellentesque posuere. Aenean sed dui at nisi sodales rutrum. Nulla dapibus nunc et justo varius cursus.
        </Text>
      </Section>
    </Container>
  );
};

// Стили для компонента
const Container = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '20px',
});

const Section = styled('div', {
  marginBottom: '30px',
});

const Title = styled('h2', {
  fontSize: '24px',
  marginBottom: '10px',
  color: '#333',
});

const Text = styled('p', {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#555',
});
