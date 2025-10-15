import { Equipment } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { useEffect } from 'react';

type EquipmentPopupProps = {
  equipment: Equipment | null;
  onClose: () => void;
};

export const EquipmentPopup = ({ equipment, onClose }: EquipmentPopupProps) => {
  if (!equipment) return null;

  // Обработка клавиши Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <Overlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <PopupHeader>
          <Text size="l" weight="bold">
            {equipment.name}
          </Text>
          <CloseButton onClick={onClose}>×</CloseButton>
        </PopupHeader>
        
        <PopupContent>
          <InfoRow>
            <Text weight="bold">Место:</Text>
            <Text>{equipment.place_id}</Text>
          </InfoRow>
          
          <InfoRow>
            <Text weight="bold">Категория:</Text>
            <Text>{equipment.category}</Text>
          </InfoRow>
          
          <InfoRow>
            <Text weight="bold">Производитель:</Text>
            <Text>{equipment.manufacturer}</Text>
          </InfoRow>
          
          <InfoRow>
            <Text weight="bold">Версия:</Text>
            <Text>{equipment.version}</Text>
          </InfoRow>
          
          <InfoRow>
            <Text weight="bold">Дата закупки:</Text>
            <Text>{equipment.releaseDate}</Text>
          </InfoRow>
          
          {equipment.softwareEndDate && (
            <InfoRow>
              <Text weight="bold">Дата снятия с поддержки:</Text>
              <Text>{equipment.softwareEndDate}</Text>
            </InfoRow>
          )}
        </PopupContent>
      </PopupContainer>
    </Overlay>
  );
};

const Overlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 99999,
});

const PopupContainer = styled('div', {
  background: 'white',
  borderRadius: '8px',
  padding: '20px',
  minWidth: '300px',
  maxWidth: '500px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  position: 'relative',
  zIndex: 100000,
});

const PopupHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  paddingBottom: '12px',
  borderBottom: '1px solid #e0e0e0',
});

const CloseButton = styled('button', {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666',
  padding: '0',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  
  '&:hover': {
    background: '#f0f0f0',
    color: '#333',
  },
});

const PopupContent = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const InfoRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid #f0f0f0',
  
  '&:last-child': {
    borderBottom: 'none',
  },
});
