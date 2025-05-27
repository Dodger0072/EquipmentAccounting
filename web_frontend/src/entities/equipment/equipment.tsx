import { Equipment as EquipmentType } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { getType } from '@/shared/lib/get-type';
import { useState } from 'react';
import { AddEquipmentPopup } from '@/widgets/equipment-list/ui/organisms/euipment-popup';

type EquipmentProps = {
    equipment: EquipmentType;
    displayNumber: number;
    onDelete: () => void;
    onUpdate?: (equipment: EquipmentType) => void;
};

export const Equipment = ({ equipment, displayNumber, onDelete, onUpdate }: EquipmentProps) => {
    const type = getType(equipment.softwareEndDate);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleSumbit = (data: EquipmentType) => {
        onUpdate?.(data);
        setIsEditOpen(false);
    }
    return (
        <EquipmentContainer type={type}>
            <Text>{displayNumber}</Text>
            <Text>{equipment.name}</Text>
            <DeleteButtonStyled onClick={onDelete}>Удалить</DeleteButtonStyled>
            <EditButtonStyled onClick={() => setIsEditOpen(true)}>Редактировать</EditButtonStyled>

            <Text>{equipment.releaseDate ? new Date(equipment.releaseDate).toLocaleDateString() : 'Нет данных'}</Text>
            <Text>{equipment.softwareStartDate}</Text>
            <Text>{equipment.softwareEndDate}</Text>
            <Text>
                <EquipmentLink href={equipment.manufacturer}>
                    Производитель
                </EquipmentLink>
            </Text>
            <Text>{equipment.place_id}</Text>
            {isEditOpen && (
                <AddEquipmentPopup
                    initialData={equipment}
                    onSubmit={handleSumbit}
                    onClose={() => setIsEditOpen(false)}
                />
            )}
        </EquipmentContainer>
    );
};

const EquipmentContainer = styled('div', {
    display: 'grid',
    gridTemplateColumns: '0.5fr 1.5fr 0.65fr 1.2fr 1fr 1fr 1fr 1fr 1fr',
    padding: '16px',
    borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
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

const EquipmentLink = styled('a', {
    color: '#2563eb',
    textDecoration: 'none',
});

const DeleteButtonStyled = styled('button', {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center',
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        opacity: 0.9,
    },
});

const EditButtonStyled = styled('button', {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    textAlign: 'center',
    width: 'fit-content',
    height: 'fit-content',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
        opacity: 0.9,
    },
});