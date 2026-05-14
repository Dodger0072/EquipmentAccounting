import { Equipment } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/shared/auth';

import { $place, $activeCategory, $activeClassroom } from '../../model';
import { $isSidebarOpen } from '@/shared/ui/organisms/aside/model';
import { EquipmentItem } from '../atoms';
import { EquipmentPopup } from '../atoms/equipment-popup';
import { getClassroomsByMap, Classroom } from '@/app/api';

export const Map = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activeItem, setActiveItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [imageSize, setImageSize] = useState<{ width: number; height: number; naturalWidth?: number; naturalHeight?: number; left?: number; top?: number } | null>(null);

  const [place, activeCategory, activeClassroom, isSidebarOpen] = useUnit([
    $place,
    $activeCategory,
    $activeClassroom,
    $isSidebarOpen,
  ]);

  // Запрос к серверу
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!place) return;

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<{ devices: Equipment[] }>('/search');
        const allDevices = response.data.devices;

        // Фильтруем под текущий этаж, категорию и аудиторию
        const filteredItems = allDevices.filter((item) => {
          const matchesMap = item.mapId === place.id;
          const matchesCategory =
            activeCategory?.value === 'all' || item.category === activeCategory?.value;
          const matchesClassroom = !activeClassroom || item.place_id === activeClassroom;
          return matchesMap && matchesCategory && matchesClassroom;
        });

        setEquipment(filteredItems);
      } catch (err) {
        console.error('Ошибка загрузки оборудования:', err);
        setError('Не удалось загрузить оборудование');
      } finally {
        setLoading(false);
      }
    };

    const fetchClassrooms = async () => {
      if (!place) return;
      try {
        const cls = await getClassroomsByMap(place.id);
        setClassrooms(cls);
      } catch (err) {
        console.error('Ошибка загрузки аудиторий:', err);
      }
    };

    fetchEquipment();
    fetchClassrooms();
  }, [place, activeCategory, activeClassroom]);

  // Отслеживаем размер изображения для отрисовки полигонов
  const mapImageRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    const img = mapImageRef.current;
    if (img && place) {
      const updateSize = () => {
        // Получаем реальный и отображаемый размер для правильного масштабирования полигонов
        const naturalWidth = img.naturalWidth || img.width;
        const naturalHeight = img.naturalHeight || img.height;
        const displayWidth = img.offsetWidth || img.clientWidth;
        const displayHeight = img.offsetHeight || img.clientHeight;
        
        // Получаем позицию изображения относительно MapContainer
        const imgRect = img.getBoundingClientRect();
        const container = img.parentElement;
        const containerRect = container?.getBoundingClientRect();
        const left = containerRect ? imgRect.left - containerRect.left : 0;
        const top = containerRect ? imgRect.top - containerRect.top : 0;
        
        if (naturalWidth > 0 && naturalHeight > 0 && displayWidth > 0 && displayHeight > 0) {
          // Сохраняем и реальный размер, и отображаемый для правильного масштабирования
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
      
      // Ждем загрузки изображения
      if (img.complete) {
        updateSize();
      } else {
        img.addEventListener('load', updateSize);
      }
      
      updateSize();
      window.addEventListener('resize', updateSize);
      
      // Используем ResizeObserver для более точного отслеживания изменений размера
      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(img);
      
      // Также отслеживаем изменения в родительском контейнере
      const container = img.parentElement;
      if (container) {
        resizeObserver.observe(container);
      }
      
      // Отслеживаем изменения состояния сайдбара через MutationObserver
      const mutationObserver = new MutationObserver(updateSize);
      if (container) {
        mutationObserver.observe(container, {
          attributes: true,
          attributeFilter: ['style', 'class'],
          subtree: true
        });
      }
      
      return () => {
        img.removeEventListener('load', updateSize);
        window.removeEventListener('resize', updateSize);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      };
    }
  }, [place, isSidebarOpen]);

  // Дополнительное обновление при изменении состояния сайдбара
  useEffect(() => {
    if (mapImageRef.current) {
      // Даем браузеру время на перерисовку layout после изменения сайдбара
      const timeoutId = setTimeout(() => {
        const img = mapImageRef.current;
        if (img) {
          const naturalWidth = img.naturalWidth || img.width;
          const naturalHeight = img.naturalHeight || img.height;
          const displayWidth = img.offsetWidth || img.clientWidth;
          const displayHeight = img.offsetHeight || img.clientHeight;
          
          const imgRect = img.getBoundingClientRect();
          const container = img.parentElement;
          const containerRect = container?.getBoundingClientRect();
          const left = containerRect ? imgRect.left - containerRect.left : 0;
          const top = containerRect ? imgRect.top - containerRect.top : 0;
          
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
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSidebarOpen]);

  const handleEquipmentClick = (equipment: Equipment) => {
    setActiveItem(equipment);
  };

  const handleClosePopup = () => {
    setActiveItem(null);
  };

  if (loading) {
    return <Text>Загрузка оборудования...</Text>;
  }

  if (error) {
    return <Text color="alert">{error}</Text>;
  }

  return (
    <div>
      <MapContainer>
        <img ref={mapImageRef} src={place?.mapUrl} alt="Map" />
        {imageSize && mapImageRef.current && (() => {
          const img = mapImageRef.current!;
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
        {equipment.map((equipment) => (
          <EquipmentItem
            key={equipment.id}
            equipment={equipment}
            onClick={() => handleEquipmentClick(equipment)}
          />
        ))}
      </MapContainer>

      <EquipmentPopup 
        equipment={activeItem} 
        onClose={handleClosePopup} 
      />
    </div>
  );
};


const StyledText = styled(Text, {
  marginTop: '12px',
});

const MapContainer = styled('div', {
  width: 'fit-content',
  position: 'relative',
  margin: 'auto',
  overflow: 'hidden',
  border: '1px solid black',
  display: 'inline-block',
  '& > img': {
    width: '100%',
    height: 'auto',
    cursor: 'grab',
    display: 'block',
  },
});

const ClassroomOverlay = styled('svg', {
  position: 'absolute',
  pointerEvents: 'none',
  zIndex: 1,
});