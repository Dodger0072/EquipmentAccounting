import { SelectItem } from '@/shared/types/select-item';
import { createEffect, createEvent, createStore, sample } from 'effector';

export const setActiveCategory = createEvent<SelectItem>();

export const $categories = createStore<SelectItem[]>([]);
export const $activeCategory = createStore<SelectItem | null>(null).on(
  setActiveCategory,
  (_, payload) => payload,
);

const categoryMappings = [
  { id: 0, label: 'Все оборудование', value: 'all' },
  { id: 1, label: 'Роутеры', value: 'router' },
  { id: 2, label: 'Сервера', value: 'server' },
  { id: 3, label: 'Компьютеры', value: 'desktop' },
];

export const fetchCategoriesFx = createEffect(async () => {
  return new Promise<SelectItem[]>((resolve) => {
    setTimeout(() => {
      resolve(
        categoryMappings.map((category) => ({
          id: category.id,
          label: category.label,
          value: category.value,
        })),
      );
    }, 500);
  });
});

sample({
  clock: fetchCategoriesFx.doneData,
  target: $categories,
});

sample({
  clock: fetchCategoriesFx.doneData,
  fn: (data: SelectItem[]) => data[0],
  target: $activeCategory,
});
