// src/widgets/equipment-list/model/index.ts

import { Equipment } from '@/shared/types';
import { SelectItem } from '@/shared/types/select-item';
import { createEvent, createStore, createEffect } from 'effector';
import axios from 'axios';

// События
export const addEquipment = createEvent<Equipment>();
export const setFilter = createEvent<SelectItem>();
export const deleteEquipment = createEvent<number>();
export const updateEquipment = createEvent<Equipment>();

// Эффекты
export const fetchEquipmentFx = createEffect(async () => {
    const response = await axios.get('http://localhost:8000/search');
    return response.data.devices;
});

export const fetchCategoriesFx = createEffect(async () => {
    const response = await axios.get('http://localhost:8000/categories');
    return response.data;
});

export const updateEquipmentFx = createEffect(async (equipment: Equipment) => {
    console.log("updateEquipmentFx: Received equipment:", equipment);
    console.log("updateEquipmentFx: Equipment ID:", equipment.id);
    console.log("updateEquipmentFx: Making PUT request to:", `http://localhost:8000/update_device/${equipment.id}`);
    
    const response = await axios.put(`http://localhost:8000/update_device/${equipment.id}`, equipment);
    return response.data.device;
});

// Сторы
const items: SelectItem[] = [
    { label: 'Все', id: 1, value: 'all' },
    { label: 'Устаревающие', id: 2, value: 'outdated-soon' },
    { label: 'Устаревшие', id: 3, value: 'outdated' },
];

export const $equipmentCategories = createStore<any[]>([])
    .on(fetchCategoriesFx.doneData, (_, categories) => categories);

export const $items = createStore<Equipment[]>([])
    .on(addEquipment, (state, newItem) => [...state, newItem])
    .on(fetchEquipmentFx.doneData, (_, items) => items)
    .on(deleteEquipment, (state, id) => state.filter(item => item.id !== id))
    .on(updateEquipment, (state, updatedItem) => 
        state.map(item => item.id === updatedItem.id ? updatedItem : item)
    )
    .on(updateEquipmentFx.doneData, (state, updatedItem) => 
        state.map(item => item.id === updatedItem.id ? updatedItem : item)
    );

export const $filterSelect = createStore<SelectItem[]>(items);
export const $chosenFilter = createStore<SelectItem>(items[0])
    .on(setFilter, (_, filter) => filter);