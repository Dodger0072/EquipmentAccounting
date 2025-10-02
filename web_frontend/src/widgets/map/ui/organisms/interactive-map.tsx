import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@stitches/react';
import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { Place } from '@/shared/types/place';
import { $places, fetchPlacesFx } from '../../model';
import { EnlargedMapModal } from './enlarged-map-modal';

interface InteractiveMapProps {
  onLocationSelect: (x: number, y: number, mapId: number) => void;
  selectedLocation?: { x: number; y: number; mapId: number } | null;
  selectedMapId?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  onLocationSelect,
  selectedLocation,
  selectedMapId
}) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [showEnlargedModal, setShowEnlargedModal] = useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [places] = useUnit([$places]);

  useEffect(() => {
    fetchPlacesFx();
  }, []);

  // Устанавливаем выбранное место при изменении selectedMapId
  useEffect(() => {
    if (selectedMapId && places.length > 0) {
      const place = places.find(p => p.id === selectedMapId);
      if (place) {
        setSelectedPlace(place);
      }
    }
  }, [selectedMapId, places]);

  // Показываем выбранную позицию если она есть
  useEffect(() => {
    if (selectedLocation && selectedLocation.mapId === selectedPlace?.id) {
      setClickPosition({ x: selectedLocation.x, y: selectedLocation.y });
    } else {
      setClickPosition(null);
    }
  }, [selectedLocation, selectedPlace]);

  const handleMapClick = () => {
    if (selectedPlace) {
      setShowEnlargedModal(true);
    }
  };

  const handlePlaceChange = (place: Place | null) => {
    setSelectedPlace(place);
    setClickPosition(null);
    if (place) {
      // Сбрасываем выбранную позицию при смене этажа
      onLocationSelect(0, 0, place.id);
    }
  };


  const handleEnlargedLocationSelect = (x: number, y: number) => {
    if (selectedPlace) {
      setClickPosition({ x, y });
      onLocationSelect(x, y, selectedPlace.id);
    }
  };

  const handleCloseEnlargedModal = () => {
    setShowEnlargedModal(false);
  };

  return (
    <Container>
      <ControlsContainer>
        <Select
          label="Выберите этаж"
          items={places}
          value={selectedPlace}
          onChange={handlePlaceChange}
          getItemLabel={(item: Place) => item.label}
          getItemKey={(item: Place) => item.id.toString()}
          placeholder="Выберите этаж для размещения"
        />
      </ControlsContainer>
      
      {selectedPlace && (
        <MapContainer ref={mapRef} onClick={handleMapClick}>
          <MapImage 
            ref={imageRef}
            src={selectedPlace.mapUrl} 
            alt={`Карта ${selectedPlace.label}`}
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
          
          <ClickHint>
            Кликните на карту для открытия увеличенного режима выбора места
          </ClickHint>
        </MapContainer>
      )}
      
      {!selectedPlace && (
        <PlaceholderContainer>
          <PlaceholderText>
            Выберите этаж для размещения оборудования
          </PlaceholderText>
        </PlaceholderContainer>
      )}
      
      {showEnlargedModal && selectedPlace && (
        <EnlargedMapModal
          place={selectedPlace}
          onClose={handleCloseEnlargedModal}
          onLocationSelect={handleEnlargedLocationSelect}
          initialLocation={clickPosition}
        />
      )}
    </Container>
  );
};

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
});

const ControlsContainer = styled('div', {
  display: 'flex',
  gap: '12px',
  alignItems: 'end',
});


const MapContainer = styled('div', {
  position: 'relative',
  border: '2px solid #e5e7eb',
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'pointer',
  backgroundColor: '#f9fafb',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    borderColor: '#3b82f6',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
  },
});

const MapImage = styled('img', {
  width: '100%',
  height: 'auto',
  display: 'block',
  maxHeight: '400px',
  objectFit: 'contain',
});

const LocationMarker = styled('div', {
  position: 'absolute',
  width: '20px',
  height: '20px',
  backgroundColor: '#ef4444',
  border: '3px solid #ffffff',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  zIndex: 10,
  
  '&::after': {
    content: '',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '8px',
    height: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  },
});

const ClickHint = styled('div', {
  position: 'absolute',
  bottom: '8px',
  left: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '8px 12px',
  borderRadius: '4px',
  fontSize: '12px',
  textAlign: 'center',
});

const PlaceholderContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  border: '2px dashed #d1d5db',
  borderRadius: '8px',
  backgroundColor: '#f9fafb',
});

const PlaceholderText = styled('div', {
  color: '#6b7280',
  fontSize: '14px',
  textAlign: 'center',
});
