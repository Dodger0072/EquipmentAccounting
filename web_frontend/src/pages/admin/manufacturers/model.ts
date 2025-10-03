import { createEffect, createEvent, createStore, sample } from 'effector';
import { getManufacturers, addManufacturer, updateManufacturer, deleteManufacturer, getCategories, Manufacturer, Category } from '@/app/api';

// События
export const fetchManufacturers = createEvent();
export const addManufacturerEvent = createEvent<Omit<Manufacturer, 'id' | 'category_name'>>();
export const updateManufacturerEvent = createEvent<{ id: number; data: Partial<Manufacturer> }>();
export const deleteManufacturerEvent = createEvent<number>();
export const setEditingManufacturer = createEvent<Manufacturer | null>();
export const setSelectedCategory = createEvent<number | null>();

// Сторы
export const $manufacturers = createStore<Manufacturer[]>([]);
export const $categories = createStore<Category[]>([]);
export const $isLoading = createStore<boolean>(false);
export const $error = createStore<string | null>(null);
export const $editingManufacturer = createStore<Manufacturer | null>(null);
export const $selectedCategory = createStore<number | null>(null);

// Эффекты
export const fetchManufacturersFx = createEffect(async () => {
  console.log('fetchManufacturersFx: Starting to fetch manufacturers');
  const result = await getManufacturers();
  console.log('fetchManufacturersFx: Manufacturers fetched:', result);
  return result;
});

export const fetchCategoriesFx = createEffect(async () => {
  return await getCategories();
});

export const addManufacturerFx = createEffect(async (data: Omit<Manufacturer, 'id' | 'category_name'>) => {
  return await addManufacturer(data);
});

export const updateManufacturerFx = createEffect(async ({ id, data }: { id: number; data: Partial<Manufacturer> }) => {
  return await updateManufacturer(id, data);
});

export const deleteManufacturerFx = createEffect(async (id: number) => {
  await deleteManufacturer(id);
  return id;
});

// Обновление сторов
$manufacturers
  .on(fetchManufacturersFx.doneData, (_, manufacturers) => manufacturers)
  .on(addManufacturerFx.doneData, (state, newManufacturer) => [...state, newManufacturer])
  .on(updateManufacturerFx.doneData, (state, updatedManufacturer) => {
    // Сохраняем исходный порядок при обновлении
    return state.map(manufacturer => 
      manufacturer.id === updatedManufacturer.id 
        ? { ...manufacturer, ...updatedManufacturer } // Обновляем только измененные поля
        : manufacturer
    );
  })
  .on(deleteManufacturerFx.doneData, (state, deletedId) =>
    state.filter(manufacturer => manufacturer.id !== deletedId)
  );

$categories
  .on(fetchCategoriesFx.doneData, (_, categories) => categories);

$isLoading
  .on(fetchManufacturersFx.pending, (_, pending) => pending)
  .on(fetchCategoriesFx.pending, (_, pending) => pending)
  .on(addManufacturerFx.pending, (_, pending) => pending)
  .on(updateManufacturerFx.pending, (_, pending) => pending)
  .on(deleteManufacturerFx.pending, (_, pending) => pending);

$error
  .on(fetchManufacturersFx.failData, (_, error) => error.message)
  .on(fetchCategoriesFx.failData, (_, error) => error.message)
  .on(addManufacturerFx.failData, (_, error) => error.message)
  .on(updateManufacturerFx.failData, (_, error) => error.message)
  .on(deleteManufacturerFx.failData, (_, error) => error.message)
  .on(fetchManufacturers, () => null)
  .on(addManufacturerEvent, () => null)
  .on(updateManufacturerEvent, () => null)
  .on(deleteManufacturerEvent, () => null);

$editingManufacturer
  .on(setEditingManufacturer, (_, manufacturer) => manufacturer)
  .on(addManufacturerFx.done, () => null)
  .on(updateManufacturerFx.done, () => null);

$selectedCategory
  .on(setSelectedCategory, (_, categoryId) => categoryId);

// Сэмплы для связывания событий с эффектами
sample({
  clock: fetchManufacturers,
  target: fetchManufacturersFx,
});

sample({
  clock: addManufacturerEvent,
  target: addManufacturerFx,
});

sample({
  clock: updateManufacturerEvent,
  target: updateManufacturerFx,
});

sample({
  clock: deleteManufacturerEvent,
  target: deleteManufacturerFx,
});
