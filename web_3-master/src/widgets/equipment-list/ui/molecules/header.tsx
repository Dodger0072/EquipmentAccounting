import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';

export const Header = () => {
  return (
    <HeaderContainer>
      <Text>ID</Text>
      <Text>Название</Text>
      <Text>Дата выпуска</Text>
      <Text>Выпуск ПО</Text>
      <Text>Конец ПО</Text>
      <Text>Ссылка</Text>
      <Text>Место</Text>
    </HeaderContainer>
  );
};

const HeaderContainer = styled('div', {
  display: 'grid',
  gridTemplateColumns: '1fr 3fr 1fr 1fr 1fr 1fr 1fr',
  padding: '16px',
  borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
  color: '#6b7280',
});
