
import { createEvent, createStore, createEffect } from 'effector';
import { Equipment } from '@/shared/types/equipment';
import { apiClient } from '@/shared/auth';


export const addEquipment = createEvent<Partial<Equipment>>();
export const fetchItems = createEvent<void>();
export const refetchItems = createEvent<void>();


export const fetchItemsFx = createEffect(async (): Promise<Equipment[]> => {
  const response = await apiClient.get<Equipment[]>('/search');
  return response.data;
});


export const $items = createStore<Record<number, Equipment>>({})
  .on(fetchItemsFx.doneData, (_, data) =>
    data.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {} as Record<number, Equipment>)
  )
  .on(addEquipment, (state, newItem) => {
    if (!newItem.id) return state;

    return {
      ...state,
      [newItem.id as number]: {
        ...(state[newItem.id as number] || {}),
        ...newItem,
      },
    };
  });


fetchItems.watch(() => fetchItemsFx());
refetchItems.watch(() => fetchItems());