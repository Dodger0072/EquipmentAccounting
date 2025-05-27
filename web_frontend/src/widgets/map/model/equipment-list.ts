
import { createEvent, createStore, createEffect } from 'effector';
import { Equipment } from '@/shared/types/equipment';
import axios from 'axios';


export const addEquipment = createEvent<Partial<Equipment>>();
export const fetchItems = createEvent<void>();
export const refetchItems = createEvent<void>();


export const fetchItemsFx = createEffect(async (): Promise<Equipment[]> => {
  const response = await axios.get<Equipment[]>('http://localhost:8000/search');
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