import { createEffect, createEvent, createStore, sample } from 'effector';
import { getCategories, addCategory, updateCategory, deleteCategory, Category } from '@/app/api';

// События
export const fetchCategories = createEvent();
export const addCategoryEvent = createEvent<Omit<Category, 'id'>>();
export const updateCategoryEvent = createEvent<{ id: number; data: Partial<Category> }>();
export const deleteCategoryEvent = createEvent<number>();
export const setEditingCategory = createEvent<Category | null>();

// Сторы
export const $categories = createStore<Category[]>([]);
export const $isLoading = createStore<boolean>(false);
export const $error = createStore<string | null>(null);
export const $editingCategory = createStore<Category | null>(null);

// Эффекты
export const fetchCategoriesFx = createEffect(async () => {
  return await getCategories();
});

export const addCategoryFx = createEffect(async (data: Omit<Category, 'id'>) => {
  return await addCategory(data);
});

export const updateCategoryFx = createEffect(async ({ id, data }: { id: number; data: Partial<Category> }) => {
  return await updateCategory(id, data);
});

export const deleteCategoryFx = createEffect(async (id: number) => {
  await deleteCategory(id);
  return id;
});

// Обновление сторов
$categories
  .on(fetchCategoriesFx.doneData, (_, categories) => categories)
  .on(addCategoryFx.doneData, (state, newCategory) => [...state, newCategory])
  .on(updateCategoryFx.doneData, (state, updatedCategory) =>
    state.map(category => category.id === updatedCategory.id ? updatedCategory : category)
  )
  .on(deleteCategoryFx.doneData, (state, deletedId) =>
    state.filter(category => category.id !== deletedId)
  );

$isLoading
  .on(fetchCategoriesFx.pending, (_, pending) => pending)
  .on(addCategoryFx.pending, (_, pending) => pending)
  .on(updateCategoryFx.pending, (_, pending) => pending)
  .on(deleteCategoryFx.pending, (_, pending) => pending);

$error
  .on(fetchCategoriesFx.failData, (_, error) => error.message)
  .on(addCategoryFx.failData, (_, error) => error.message)
  .on(updateCategoryFx.failData, (_, error) => error.message)
  .on(deleteCategoryFx.failData, (_, error) => error.message)
  .on(fetchCategories, () => null)
  .on(addCategoryEvent, () => null)
  .on(updateCategoryEvent, () => null)
  .on(deleteCategoryEvent, () => null);

$editingCategory
  .on(setEditingCategory, (_, category) => category)
  .on(addCategoryFx.done, () => null)
  .on(updateCategoryFx.done, () => null);

// Сэмплы для связывания событий с эффектами
sample({
  clock: fetchCategories,
  target: fetchCategoriesFx,
});

sample({
  clock: addCategoryEvent,
  target: addCategoryFx,
});

sample({
  clock: updateCategoryEvent,
  target: updateCategoryFx,
});

sample({
  clock: deleteCategoryEvent,
  target: deleteCategoryFx,
});
