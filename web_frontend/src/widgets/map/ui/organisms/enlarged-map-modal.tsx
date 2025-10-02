import React, { useState, useRef } from 'react';
import { styled } from '@stitches/react';
import { Place } from '@/shared/types/place';

interface EnlargedMapModalProps {
  place: Place;
  onClose: () => void;
  onLocationSelect: (x: number, y: number) => void;
  initialLocation?: { x: number; y: number } | null;
}

export const EnlargedMapModal: React.FC<EnlargedMapModalProps> = ({
  place,
  onClose,
  onLocationSelect,
  initialLocation
}) => {
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(
    initialLocation || null
  );
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const imageRect = imageRef.current.getBoundingClientRect();
    
    // Вычисляем относительные координаты клика по изображению
    const x = event.clientX - imageRect.left;
    const y = event.clientY - imageRect.top;
    
    // Проверяем, что клик был по изображению
    if (x >= 0 && y >= 0 && x <= imageRect.width && y <= imageRect.height) {
      // Нормализуем координаты как проценты (0-100)
      const percentX = Math.round((x / imageRect.width) * 100 * 100) / 100;
      const percentY = Math.round((y / imageRect.height) * 100 * 100) / 100;
      
      setClickPosition({ x: percentX, y: percentY });
    }
  };

  const handleConfirm = () => {
    if (clickPosition) {
      onLocationSelect(clickPosition.x, clickPosition.y);
      onClose();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>Выберите точное место размещения - {place.label}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <MapContainer onClick={handleMapClick}>
          <MapImage 
            ref={imageRef}
            src={place.mapUrl} 
            alt={`Увеличенная карта ${place.label}`}
            draggable={false}
          />
          
          {clickPosition && (
            <LocationMarker
              style={{
                left: `${clickPosition.x}%`,
                top: `${clickPosition.y}%`,
              }}
            />
          )}
          
          <MapHint>
            Кликните на карту для выбора точного места размещения оборудования
          </MapHint>
        </MapContainer>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>
            Отмена
          </CancelButton>
          <ConfirmButton 
            onClick={handleConfirm}
            disabled={!clickPosition}
          >
            Подтвердить выбор
          </ConfirmButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

const ModalOverlay = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  padding: '20px',
});

const ModalContainer = styled('div', {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '90vw',
  maxHeight: '90vh',
  width: '1000px',
  overflow: 'hidden',
});

const ModalHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
});

const ModalTitle = styled('h2', {
  margin: 0,
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
});

const CloseButton = styled('button', {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#6b7280',
  padding: '4px',
  borderRadius: '4px',
  
  '&:hover': {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
});

const MapContainer = styled('div', {
  position: 'relative',
  cursor: 'crosshair',
  backgroundColor: '#f9fafb',
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'auto',
  padding: '20px',
});

const MapImage = styled('img', {
  maxWidth: '100%',
  maxHeight: '100%',
  display: 'block',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
});

const LocationMarker = styled('div', {
  position: 'absolute',
  width: '24px',
  height: '24px',
  backgroundColor: '#ef4444',
  border: '4px solid #ffffff',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
  zIndex: 10,
  
  '&::after': {
    content: '',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '10px',
    height: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

const MapHint = styled('div', {
  position: 'absolute',
  bottom: '12px',
  left: '12px',
  right: '12px',
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  color: 'white',
  padding: '12px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  textAlign: 'center',
});

const ModalFooter = styled('div', {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  padding: '20px 24px',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
});

const CancelButton = styled('button', {
  padding: '10px 20px',
  backgroundColor: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  
  '&:hover': {
    backgroundColor: '#e5e7eb',
  },
});

const ConfirmButton = styled('button', {
  padding: '10px 20px',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  
  '&:hover': {
    backgroundColor: '#2563eb',
  },
  
  '&:disabled': {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
});