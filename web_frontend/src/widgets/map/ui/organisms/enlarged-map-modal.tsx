import React, { useState, useRef, useEffect } from 'react';
import { styled } from '@stitches/react';
import { Place } from '@/shared/types/place';
import { getClassroomsByMap, findClassroomByPoint, Classroom } from '@/app/api';

interface EnlargedMapModalProps {
  place: Place;
  onClose: () => void;
  onLocationSelect: (x: number, y: number, classroomName?: string) => void;
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
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [imageSize, setImageSize] = useState<{ width: number; height: number; naturalWidth?: number; naturalHeight?: number; left?: number; top?: number } | null>(null);
  const [foundClassroom, setFoundClassroom] = useState<Classroom | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        const cls = await getClassroomsByMap(place.id);
        setClassrooms(cls);
      } catch (err) {
        console.error('Ошибка загрузки аудиторий:', err);
      }
    };
    loadClassrooms();
  }, [place.id]);

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      const updateSize = () => {
        // Получаем реальный и отображаемый размер для правильного масштабирования полигонов
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;
        const displayWidth = img.offsetWidth || img.clientWidth;
        const displayHeight = img.offsetHeight || img.clientHeight;
        
        // Получаем позицию изображения относительно контейнера
        // Используем offsetLeft/offsetTop для более надежного результата
        const left = img.offsetLeft || 0;
        const top = img.offsetTop || 0;
        
        if (naturalWidth > 0 && naturalHeight > 0 && displayWidth > 0 && displayHeight > 0) {
          setImageSize({ 
            width: displayWidth, 
            height: displayHeight,
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            left: left,
            top: top
          });
        }
      };
      
      if (img.complete) {
        updateSize();
      } else {
        img.addEventListener('load', updateSize);
      }
      
      updateSize();
      window.addEventListener('resize', updateSize);
      
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(img);
      
      return () => {
        img.removeEventListener('load', updateSize);
        window.removeEventListener('resize', updateSize);
        resizeObserver.disconnect();
      };
    }
  }, [place.mapUrl]);

  const handleMapClick = async (event: React.MouseEvent<HTMLDivElement>) => {
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
      
      // Ищем аудиторию по координатам
      try {
        const result = await findClassroomByPoint(place.id, percentX, percentY);
        setFoundClassroom(result.classroom || null);
      } catch (err) {
        console.error('Ошибка поиска аудитории:', err);
        setFoundClassroom(null);
      }
    }
  };

  const handleConfirm = () => {
    if (clickPosition) {
      onLocationSelect(clickPosition.x, clickPosition.y, foundClassroom?.name);
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
          {imageSize && imageRef.current && (() => {
            const img = imageRef.current!;
            const naturalWidth = imageSize.naturalWidth || img.naturalWidth || img.width;
            const naturalHeight = imageSize.naturalHeight || img.naturalHeight || img.height;
            
            // Масштабируем координаты из процентов относительно реального размера
            // в координаты относительно отображаемого размера
            const scaleX = imageSize.width / naturalWidth;
            const scaleY = imageSize.height / naturalHeight;
            
            // Функция для вычисления центра полигона
            const getPolygonCenter = (points: Array<{ x: number; y: number }>) => {
              let sumX = 0, sumY = 0;
              points.forEach(p => {
                const realX = (p.x / 100) * naturalWidth;
                const realY = (p.y / 100) * naturalHeight;
                const displayX = realX * scaleX;
                const displayY = realY * scaleY;
                sumX += displayX;
                sumY += displayY;
              });
              return {
                x: sumX / points.length,
                y: sumY / points.length
              };
            };
            
            return (
              <ClassroomOverlay 
                width={imageSize.width} 
                height={imageSize.height}
                style={{
                  left: `${imageSize.left || 0}px`,
                  top: `${imageSize.top || 0}px`,
                }}
              >
                {classrooms.map((classroom) => {
                  const center = getPolygonCenter(classroom.polygon_coordinates);
                  return (
                    <g key={classroom.id}>
                      <polygon
                        points={classroom.polygon_coordinates.map(p => {
                          // Преобразуем проценты в координаты относительно реального размера
                          const realX = (p.x / 100) * naturalWidth;
                          const realY = (p.y / 100) * naturalHeight;
                          // Масштабируем к отображаемому размеру
                          const displayX = realX * scaleX;
                          const displayY = realY * scaleY;
                          return `${displayX},${displayY}`;
                        }).join(' ')}
                        fill="rgba(59, 130, 246, 0.15)"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        style={{ pointerEvents: 'none' }}
                      />
                      <text
                        x={center.x}
                        y={center.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#1E40AF"
                        fontSize="14"
                        fontWeight="600"
                        style={{ 
                          pointerEvents: 'none',
                          userSelect: 'none',
                          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 0 4px rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        {classroom.name}
                      </text>
                    </g>
                  );
                })}
              </ClassroomOverlay>
            );
          })()}
          
          {clickPosition && imageSize && imageRef.current && (() => {
            // Вычисляем абсолютные координаты маркера относительно контейнера
            // с учетом позиции и размера изображения
            const markerX = (imageSize.left || 0) + (clickPosition.x / 100) * imageSize.width;
            const markerY = (imageSize.top || 0) + (clickPosition.y / 100) * imageSize.height;
            
            return (
              <LocationMarker
                style={{
                  left: `${markerX}px`,
                  top: `${markerY}px`,
                }}
              />
            );
          })()}
          
          <MapHint>
            Кликните на карте для выбора точного места размещения оборудования
            {foundClassroom && (
              <div style={{ marginTop: '8px', fontWeight: 'bold', color: '#60A5FA' }}>
                ✓ Найдена аудитория: {foundClassroom.name}
              </div>
            )}
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
  zIndex: 2000,
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
  maxWidth: '1000px',
  maxHeight: '600px',
  width: 'auto',
  height: 'auto',
  display: 'block',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  objectFit: 'contain',
});

const ClassroomOverlay = styled('svg', {
  position: 'absolute',
  pointerEvents: 'none',
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

const PlaceNameLabel = styled('div', {
  padding: '16px 24px',
  textAlign: 'center',
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  borderTop: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
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