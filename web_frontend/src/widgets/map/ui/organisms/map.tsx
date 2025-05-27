import { Equipment } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

import { $place, $showRadius, $activeCategory } from '../../model';
import { EquipmentItem } from '../atoms';

export const Map = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [activeItem, setActiveItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [place, showRadius, activeCategory] = useUnit([
    $place,
    $showRadius,
    $activeCategory,
  ]);

  // Запрос к серверу
  useEffect(() => {
    const fetchEquipment = async () => {
      if (!place) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<{ devices: Equipment[] }>('http://localhost:8000/search');
        const allDevices = response.data.devices;

        // Фильтруем под текущий этаж и категорию
        const filteredItems = allDevices.filter((item) => {
          const matchesMap = item.mapId === place.id;
          const matchesCategory =
            activeCategory?.value === 'all' || item.category === activeCategory?.value;
          return matchesMap && matchesCategory;
        });

        setEquipment(filteredItems);
      } catch (err) {
        console.error('Ошибка загрузки оборудования:', err);
        setError('Не удалось загрузить оборудование');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [place, activeCategory]);

  const handleEquipmentClick = (equipment: Equipment) => {
    if (equipment.id === activeItem?.id) {
      setActiveItem(null);
    } else {
      setActiveItem(equipment);
    }
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
        <img src={place?.mapUrl} alt="Map" />
        {equipment.map((equipment) => (
          <EquipmentItem
            key={equipment.id}
            showRadius={showRadius || equipment.id === activeItem?.id}
            equipment={equipment}
            onClick={() => handleEquipmentClick(equipment)}
          />
        ))}
      </MapContainer>

      {activeItem && (
        <div>
          <StyledText align="center">{activeItem.name}</StyledText>
          <StyledText align="center">{activeItem.softwareEndDate}</StyledText>
        </div>
      )}
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
  '& > img': {
    width: '100%',
    height: 'auto',
    cursor: 'grab',
  },
});