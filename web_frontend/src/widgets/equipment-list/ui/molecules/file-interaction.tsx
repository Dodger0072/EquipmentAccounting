import { exportEqupment } from '@/shared/lib/export-equipment';
import { printEqupment } from '@/shared/lib/print-equipment';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { $items } from '../../model';

export const FileInteraction = () => {
  const equpmentList = useUnit($items);

  const totalDevices = equpmentList.length;

  const deviceByMap = equpmentList.reduce((acc, item) => {
    const floor = item.mapId || 0;
    acc[floor] = (acc[floor] || 0) + 1;
    return acc;
  }, {} as Record<number, number>)

  const floor1 = deviceByMap[1] || 0;
  const floor2 = deviceByMap[2] || 0;
  const floor3 = deviceByMap[3] || 0;

  const additionalInfo = `Всего устройств: ${totalDevices}.
  Подробно: 
  На 1 этаже - ${floor1} устр.
  На 2 этаже - ${floor2} устр.
  На 3 этаже - ${floor3} устр.`



  return (
    <Container>
      <Link onClick={() => exportEqupment(equpmentList)}>Экспорт</Link>
      <Link onClick={() => printEqupment(equpmentList)}>Печать</Link>
      <AdditionalInfo>{additionalInfo}</AdditionalInfo> {/* Добавленная строка с настроенной шириной */}
    </Container>
  );
};

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '48px',
});

const Link = styled('span', {
  cursor: 'pointer',
  color: '#2563eb',
});

const AdditionalInfo = styled('span', {
  width: '250px', // Настройка ширины блока
});
