import { createEffect, createEvent, createStore, sample } from 'effector';
import { getClassrooms, addClassroom, updateClassroom, deleteClassroom, deleteDevice, Classroom } from '@/app/api';

// События
export const fetchClassrooms = createEvent();
export const addClassroomEvent = createEvent<Omit<Classroom, 'id'>>();
export const updateClassroomEvent = createEvent<{ id: number; data: Partial<Classroom> }>();
export const deleteClassroomEvent = createEvent<number>();
export const setEditingClassroom = createEvent<Classroom | null>();
export const setErrorModalOpen = createEvent<boolean>();
export const setErrorDevices = createEvent<any[]>();
export const deleteDeviceEvent = createEvent<number>();
export const setCurrentClassroomId = createEvent<number | null>();
export const setSuccessMessage = createEvent<string | null>();

// Сторы
export const $classrooms = createStore<Classroom[]>([]);
export const $isLoading = createStore<boolean>(false);
export const $error = createStore<string | null>(null);
export const $editingClassroom = createStore<Classroom | null>(null);
export const $errorModalOpen = createStore<boolean>(false);
export const $errorDevices = createStore<any[]>([]);
export const $currentClassroomId = createStore<number | null>(null);
export const $successMessage = createStore<string | null>(null);

// Эффекты
export const fetchClassroomsFx = createEffect(async () => {
  const result = await getClassrooms();
  return result;
});

export const addClassroomFx = createEffect(async (data: Omit<Classroom, 'id'>) => {
  return await addClassroom(data);
});

export const updateClassroomFx = createEffect(async ({ id, data }: { id: number; data: Partial<Classroom> }) => {
  return await updateClassroom(id, data);
});

export const deleteClassroomFx = createEffect(async (id: number) => {
  try {
    await deleteClassroom(id);
    return id;
  } catch (error) {
    console.error('Error in deleteClassroomFx:', error);
    throw error;
  }
});

export const deleteDeviceFx = createEffect(async (deviceId: number) => {
  await deleteDevice(deviceId);
  return deviceId;
});

// Обновление сторов
$classrooms
  .on(fetchClassroomsFx.doneData, (_, classrooms) => classrooms)
  .on(addClassroomFx.doneData, (state, newClassroom) => [...state, newClassroom])
  .on(updateClassroomFx.doneData, (state, updatedClassroom) => {
    return state.map(classroom => 
      classroom.id === updatedClassroom.id 
        ? { ...classroom, ...updatedClassroom }
        : classroom
    );
  })
  .on(deleteClassroomFx.doneData, (state, deletedId) =>
    state.filter(classroom => classroom.id !== deletedId)
  );

$isLoading
  .on(fetchClassroomsFx.pending, (_, pending) => pending)
  .on(addClassroomFx.pending, (_, pending) => pending)
  .on(updateClassroomFx.pending, (_, pending) => pending)
  .on(deleteClassroomFx.pending, (_, pending) => pending);

$error
  .on(fetchClassroomsFx.failData, (_, error) => error.message)
  .on(addClassroomFx.failData, (_, error) => error.message)
  .on(updateClassroomFx.failData, (_, error) => error.message)
  .on(deleteClassroomFx.failData, (_, error) => {
    console.log('Delete classroom error:', error);
    
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
    
    return error.message;
  })
  .on(fetchClassrooms, () => null)
  .on(addClassroomEvent, () => null)
  .on(updateClassroomEvent, () => null)
  .on(deleteClassroomEvent, () => null);

$editingClassroom
  .on(setEditingClassroom, (_, classroom) => classroom)
  .on(addClassroomFx.done, () => null)
  .on(updateClassroomFx.done, () => null);

$errorModalOpen
  .on(setErrorModalOpen, (_, isOpen) => isOpen);

$errorDevices
  .on(setErrorDevices, (_, devices) => devices)
  .on(deleteDeviceFx.doneData, (state, deletedDeviceId) => {
    const newState = state.filter(device => device.id !== deletedDeviceId);
    if (newState.length === 0) {
      setErrorModalOpen(false);
      const classroomId = $currentClassroomId.getState();
      if (classroomId) {
        setTimeout(() => deleteClassroomEvent(classroomId), 100);
      }
    }
    return newState;
  });

$currentClassroomId
  .on(setCurrentClassroomId, (_, classroomId) => classroomId);

$successMessage
  .on(setSuccessMessage, (_, message) => message)
  .on(deleteClassroomFx.doneData, () => 'Аудитория успешно удалена')
  .on(deleteDeviceFx.doneData, () => 'Устройство успешно удалено')
  .on(fetchClassrooms, () => null)
  .on(addClassroomEvent, () => null)
  .on(updateClassroomEvent, () => null)
  .on(deleteClassroomEvent, () => null);

// Сэмплы
sample({
  clock: fetchClassrooms,
  target: fetchClassroomsFx,
});

sample({
  clock: addClassroomEvent,
  target: addClassroomFx,
});

sample({
  clock: updateClassroomEvent,
  target: updateClassroomFx,
});

sample({
  clock: deleteClassroomEvent,
  target: deleteClassroomFx,
});

sample({
  clock: deleteDeviceEvent,
  target: deleteDeviceFx,
});

