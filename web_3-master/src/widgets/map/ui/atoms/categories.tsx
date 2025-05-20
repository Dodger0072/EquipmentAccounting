import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import {
  $activeCategory,
  $categories,
  fetchCategoriesFx,
  setActiveCategory,
} from '../../model';

export const Categories = () => {
  const [categories, activeCategory, setActiveCategoryEv, fetchCategories] =
    useUnit([
      $categories,
      $activeCategory,
      setActiveCategory,
      fetchCategoriesFx,
    ]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <>
      <Select
        label='Категория'
        items={categories}
        value={activeCategory}
        onChange={({ value }) =>
          setActiveCategoryEv(
            categories.find((category) => category.value === value) ||
              categories[0]
          )
        }
      />
    </>
  );
};
