import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { $chosenFilter, $filterSelect, setFilter } from '../../model';

interface CategoryProps {
  onChange: (categoryId: number | null) => void;
}

export const Category: React.FC<CategoryProps> = ({ onChange }) => {
  const [items, chosenFilter, setFilterEvent] = useUnit([
    $filterSelect,
    $chosenFilter,
    setFilter,
  ]);

  const handleCategoryChange = (item: any) => {
    setFilterEvent(item || items[0]);
    onChange(item ? item.id : null); // Передаем id выбранной категории
  };

  return (
    <Select
      items={items}
      value={chosenFilter}
      onChange={handleCategoryChange}
    />
  );
};
