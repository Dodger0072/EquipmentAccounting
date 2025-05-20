import { exportEqupment } from '@/shared/lib/export-equipment';
import { printEqupment } from '@/shared/lib/print-equipment';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { $items } from '../../model';

export const FileInteraction = () => {
  const equpmentList = useUnit($items);

  // Дополнительная строка
  const additionalInfo = 'Всего устройсв: 6. Подробнее: На 1 этаже находятся 4 устр. На 2 этаже находятся 2 устр. На 3 этаже находятся 0 устр.';

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
