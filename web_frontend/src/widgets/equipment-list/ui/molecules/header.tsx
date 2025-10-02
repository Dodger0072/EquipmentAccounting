import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';

export const Header = () => {
    return (
        <HeaderContainer>
            <Text>Действия</Text>
            <Text>№</Text>
            <Text>Название</Text>
            <Text>Дата закупки</Text>
            <Text>Дата устаревания</Text>
            <Text>Дата снятия</Text>
            <Text>Производитель</Text>
            <Text>Место</Text>
        </HeaderContainer>
    );
};

const HeaderContainer = styled('div', {
    display: 'grid',
    gridTemplateColumns: '80px 60px 200px 120px 120px 120px 150px 100px',
    padding: '20px 16px',
    borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
    color: '#6b7280',
    minHeight: '60px',
    alignItems: 'center',
    gap: '16px',
});