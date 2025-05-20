import { Equipment } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';

import { $place, $showRadius, $activeCategory } from '../../model';
import { EquipmentItem } from '../atoms';

const items = [
  {
    id: 1,
    name: 'Router A',
    category: 'router',
    releaseDate: '2022-01-01',
    sowftwareStartDate: '2022-02-01',
    sowftwareEndDate: '2025-12-31',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Server Room',
    xCoord: 10,
    yCoord: 28,
    waveRadius: 20,
    mapId: 1,
  },
  {
    id: 2,
    name: 'Router B',
    category: 'router',
    releaseDate: '2022-01-01',
    sowftwareStartDate: '2022-02-01',
    sowftwareEndDate: '2025-12-31',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Server Room',
    xCoord: 80,
    yCoord: 32,
    waveRadius: 30,
    mapId: 1,
  },
  {
    id: 3,
    name: 'Компьютер',
    category: 'desktop',
    releaseDate: '2021-05-15',
    sowftwareStartDate: '2021-06-01',
    sowftwareEndDate: '2024-03-12',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 52,
    yCoord: 70,
    mapId: 1,
  },
  {
    id: 4,
    name: 'Какая-то вещичка',
    category: 'server',
    releaseDate: '2023-07-05',
    sowftwareStartDate: '2023-07-05',
    sowftwareEndDate: '2024-07-05',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 70,
    yCoord: 70,
    mapId: 1,
  },
  {
    id: 5,
    name: 'Сервер',
    category: 'server',
    releaseDate: '2024-02-10',
    sowftwareStartDate: '2024-02-10',
    sowftwareEndDate: '2025-02-10',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 67,
    yCoord: 85,
    mapId: 2,
  },
  {
    id: 6,
    name: 'Компьютер',
    category: 'desktop',
    releaseDate: '2024-02-11',
    sowftwareStartDate: '2024-02-11',
    sowftwareEndDate: '2025-02-11',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 52,
    yCoord: 70,
    mapId: 2,
  },
];

export const Map = () => {
  const [activeItem, setActiveItem] = useState<Equipment | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const [place, showRadius, activeCategory] = useUnit([
    $place,
    $showRadius,
    $activeCategory,
  ]);

  useEffect(() => {
    if (place) {
      const filteredItems = items.filter(
        (item) =>
          item.mapId === place.id &&
          (activeCategory?.value === 'all' || item.category === activeCategory?.value)
      );
      setEquipment(filteredItems);
    }
  }, [place, activeCategory]);

  const handleEquipmentClick = (equipment: Equipment) => {
    if (equipment.id === activeItem?.id) {
      setActiveItem(null);
    } else {
      setActiveItem(equipment);
    }
  };

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
          <StyledText align='center'>{activeItem.name}</StyledText>
          <StyledText align='center'>{activeItem.sowftwareEndDate}</StyledText>
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
    width: '100%', // Заполнение всей доступной ширины контейнера
    height: 'auto', // Автоматическое соотношение сторон
    cursor: 'grab', // Изменение курсора при перемещении карты
  },
});
