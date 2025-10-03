import { createEffect, createEvent, createStore, sample } from 'effector';
import { getCategories, addCategory, updateCategory, deleteCategory, deleteDevice, deleteDevicesByCategory, Category } from '@/app/api';

// События
export const fetchCategories = createEvent();
export const addCategoryEvent = createEvent<Omit<Category, 'id'>>();
export const updateCategoryEvent = createEvent<{ id: number; data: Partial<Category> }>();
export const deleteCategoryEvent = createEvent<number>();
export const setEditingCategory = createEvent<Category | null>();
export const setErrorModalOpen = createEvent<boolean>();
export const setErrorDevices = createEvent<any[]>();
export const deleteDeviceEvent = createEvent<number>();
export const deleteAllDevicesEvent = createEvent<number>();
export const setCurrentCategoryId = createEvent<number | null>();
export const setSuccessMessage = createEvent<string | null>();

// Сторы
export const $categories = createStore<Category[]>([]);
export const $isLoading = createStore<boolean>(false);
export const $error = createStore<string | null>(null);
export const $editingCategory = createStore<Category | null>(null);
export const $errorModalOpen = createStore<boolean>(false);
export const $errorDevices = createStore<any[]>([]);
export const $currentCategoryId = createStore<number | null>(null);
export const $successMessage = createStore<string | null>(null);

// Эффекты
export const fetchCategoriesFx = createEffect(async () => {
  console.log('fetchCategoriesFx: Starting to fetch categories');
  const result = await getCategories();
  console.log('fetchCategoriesFx: Categories fetched:', result);
  return result;
});

export const addCategoryFx = createEffect(async (data: Omit<Category, 'id'>) => {
  return await addCategory(data);
});

export const updateCategoryFx = createEffect(async ({ id, data }: { id: number; data: Partial<Category> }) => {
  return await updateCategory(id, data);
});

export const deleteCategoryFx = createEffect(async (id: number) => {
  try {
    await deleteCategory(id);
    return id;
  } catch (error) {
    console.error('Error in deleteCategoryFx:', error);
    throw error;
  }
});

export const deleteDeviceFx = createEffect(async (deviceId: number) => {
  await deleteDevice(deviceId);
  return deviceId;
});

export const deleteAllDevicesFx = createEffect(async (categoryId: number) => {
  const result = await deleteDevicesByCategory(categoryId);
  return { categoryId, result };
});

// Обновление сторов
$categories
  .on(fetchCategoriesFx.doneData, (_, categories) => categories)
  .on(addCategoryFx.doneData, (state, newCategory) => [...state, newCategory])
  .on(updateCategoryFx.doneData, (state, updatedCategory) => {
    // Сохраняем исходный порядок при обновлении
    return state.map(category => 
      category.id === updatedCategory.id 
        ? { ...category, ...updatedCategory } // Обновляем только измененные поля
        : category
    );
  })
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
  .on(deleteCategoryFx.failData, (_, error) => {
    console.log('Delete category error:', error);
    
    // Обработка ошибки "failed to fetch"
    if (error.message === 'Failed to fetch') {
      return 'Ошибка подключения к серверу. Проверьте, что backend сервер запущен.';
    }
    
    // Если это ошибка с привязанными устройствами, показываем модальное окно
    if ((error as any).devices) {
      console.log('Devices found in error:', (error as any).devices);
      setErrorDevices((error as any).devices);
      setErrorModalOpen(true);
      return null; // Не показываем обычную ошибку
    }
    
    // Если это ошибка с привязанными производителями
    if (error.message.includes('производителя') || error.message.includes('manufacturer')) {
      return 'Нельзя удалить категорию, так как к ней привязаны производители. Сначала удалите всех производителей этой категории.';
    }
    
    return error.message;
  })
  .on(fetchCategories, () => null)
  .on(addCategoryEvent, () => null)
  .on(updateCategoryEvent, () => null)
  .on(deleteCategoryEvent, () => null);

$editingCategory
  .on(setEditingCategory, (_, category) => category)
  .on(addCategoryFx.done, () => null)
  .on(updateCategoryFx.done, () => null);

$errorModalOpen
  .on(setErrorModalOpen, (_, isOpen) => isOpen);

$errorDevices
  .on(setErrorDevices, (_, devices) => devices)
  .on(deleteDeviceFx.doneData, (state, deletedDeviceId) => {
    const newState = state.filter(device => device.id !== deletedDeviceId);
    // Если все устройства удалены, закрываем модальное окно и пытаемся удалить категорию
    if (newState.length === 0) {
      setErrorModalOpen(false);
      // Получаем ID категории из стора
      const categoryId = $currentCategoryId.getState();
      if (categoryId) {
        // Пытаемся удалить категорию снова
        setTimeout(() => deleteCategoryEvent(categoryId), 100);
      }
    }
    return newState;
  })
  .on(deleteAllDevicesFx.doneData, () => {
    // После удаления всех устройств закрываем модальное окно и пытаемся удалить категорию
    setErrorModalOpen(false);
    const categoryId = $currentCategoryId.getState();
    if (categoryId) {
      setTimeout(() => deleteCategoryEvent(categoryId), 100);
    }
    return [];
  });

$currentCategoryId
  .on(setCurrentCategoryId, (_, categoryId) => categoryId)
  .on(deleteAllDevicesFx.doneData, () => null);

$successMessage
  .on(setSuccessMessage, (_, message) => message)
  .on(deleteCategoryFx.doneData, () => 'Категория успешно удалена')
  .on(deleteDeviceFx.doneData, () => 'Устройство успешно удалено')
  .on(deleteAllDevicesFx.doneData, () => 'Все устройства успешно удалены')
  .on(fetchCategories, () => null)
  .on(addCategoryEvent, () => null)
  .on(updateCategoryEvent, () => null)
  .on(deleteCategoryEvent, () => null);

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

sample({
  clock: deleteDeviceEvent,
  target: deleteDeviceFx,
});

sample({
  clock: deleteAllDevicesEvent,
  target: deleteAllDevicesFx,
});
