import { Equipment as EquipmentType } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { getType } from '@/shared/lib/get-type';

type EquipmentProps = {
    equipment: EquipmentType;
    displayNumber: number;
    onDelete: () => void;
    onEdit: () => void;
};

export const Equipment = ({ equipment, displayNumber, onDelete, onEdit }: EquipmentProps) => {
    const type = getType(equipment.softwareEndDate || '');
    return (
        <EquipmentContainer type={type}>
            <ActionButtons>
                <IconButton 
                    onClick={onEdit}
                    title="Редактировать"
                >
                    <EditIcon />
                </IconButton>
                <IconButton 
                    onClick={onDelete}
                    title="Удалить"
                >
                    <DeleteIcon />
                </IconButton>
            </ActionButtons>
            <Text>{displayNumber}</Text>
            <Text>{equipment.name}</Text>
            <Text>{equipment.releaseDate ? equipment.releaseDate : 'Нет данных'}</Text>
            <Text>{equipment.softwareStartDate || 'Нет данных'}</Text>
            <Text>{equipment.softwareEndDate || 'Нет данных'}</Text>
            <Text>{equipment.manufacturer}</Text>
            <Text>{equipment.place_id}</Text>
        </EquipmentContainer>
    );
};

// SVG иконки

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,6 5,6 21,6"/>
        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const EquipmentContainer = styled('div', {
    display: 'grid',
    gridTemplateColumns: '80px 60px 200px 120px 120px 120px 150px 100px',
    padding: '20px 16px',
    borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
    alignItems: 'center',
    minHeight: '60px',
    gap: '16px',
    variants: {
        type: {
            warning: {
                backgroundColor: 'rgba(251, 191, 36, 0.14)',
            },
            alert: {
                backgroundColor: 'rgba(220, 38, 38, 0.14)',
            },
        },
    },
});


const ActionButtons = styled('div', {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'flex-start',
});

const IconButton = styled('button', {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280', // серый цвет
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: '#374151', // темнее при наведении
        transform: 'scale(1.1)',
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
    '& svg': {
        width: '16px',
        height: '16px',
    },
});
