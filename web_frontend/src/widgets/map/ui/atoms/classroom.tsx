import React from 'react';
import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';
import { styled } from '@stitches/react';
import { getClassroomsByMap, Classroom } from '@/app/api';
import { $place, $activeClassroom, setActiveClassroom } from '../../model';

export const ClassroomSelector = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [place, activeClassroom] = useUnit([$place, $activeClassroom]);

  useEffect(() => {
    const loadClassrooms = async () => {
      if (!place) {
        setClassrooms([]);
        return;
      }
      try {
        const cls = await getClassroomsByMap(place.id);
        setClassrooms(cls);
      } catch (err) {
        console.error('Ошибка загрузки аудиторий:', err);
        setClassrooms([]);
      }
    };
    loadClassrooms();
  }, [place]);

  // Сбрасываем выбранную аудиторию при смене этажа
  useEffect(() => {
    setActiveClassroom(null);
  }, [place]);

  const selectedClassroom = classrooms.find(c => c.name === activeClassroom) || null;

  return (
    <Container>
      <Select
        label='Аудитория'
        items={classrooms}
        value={selectedClassroom}
        onChange={(item) => setActiveClassroom(item?.name || null)}
        getItemLabel={(item: Classroom) => item.name}
        getItemKey={(item: Classroom) => item.id.toString()}
        placeholder="Все аудитории"
      />
    </Container>
  );
};

const Container = styled('div', {
  minWidth: '220px',
  width: '100%',
  '& > *': {
    width: '100%',
  },
});

