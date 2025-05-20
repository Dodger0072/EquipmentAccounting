import { Checkbox } from '@consta/uikit/Checkbox';
import { useUnit } from 'effector-react';

import { $showRadius, toggleShow } from '../../model';

export const ShowRadius = () => {
  const [isShow, toggle] = useUnit([$showRadius, toggleShow]);

  return (
    <Checkbox
      label='Показать сигнал'
      checked={isShow}
      onClick={() => toggle()}
      view='ghost'
    />
  );
};
