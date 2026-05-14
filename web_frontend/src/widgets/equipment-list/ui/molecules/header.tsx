import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { ColumnKey, ALL_COLUMNS, getGridTemplate } from '@/shared/config';

interface HeaderProps {
    visibleColumns: ColumnKey[];
}

export const Header: React.FC<HeaderProps> = ({ visibleColumns }) => {
    const columns = ALL_COLUMNS.filter((c) => visibleColumns.includes(c.key));
    const gridTemplate = getGridTemplate(visibleColumns);

    return (
        <HeaderContainer style={{ gridTemplateColumns: gridTemplate }}>
            {columns.map((col) => (
                <Text key={col.key}>{col.label}</Text>
            ))}
        </HeaderContainer>
    );
};

const HeaderContainer = styled('div', {
    display: 'grid',
  padding: '16px 12px',
    borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
    color: '#6b7280',
  minHeight: '54px',
    alignItems: 'center',
    gap: '14px',
  fontSize: '16px',
    minWidth: 'fit-content',
});
