// src/widgets/equipment-list/model/index.ts

import { Equipment } from '@/shared/types';
import { SelectItem } from '@/shared/types/select-item';
import { createEvent, createStore, createEffect } from 'effector';
import axios from 'axios';
import { updateEquipmentFx, UpdateEquipmentParams } from '@/features/equipment/model/updateEquipmentFx';

// События
export const addEquipment = createEvent<Equipment>();
export const setFilter = createEvent<SelectItem>();
export const deleteEquipment = createEvent<number>();
export const updateEquipment = createEvent<UpdateEquipmentParams>();

// Эффекты
export const fetchEquipmentFx = createEffect(async () => {
    const response = await axios.get('http://localhost:8000/search');
    return response.data.devices;
});

export const fetchCategoriesFx = createEffect(async () => {
    const response = await axios.get('http://localhost:8000/categories');
    return response.data;
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
    .on(updateEquipment, (state, { id, data }) => {
        console.log('updateEquipment - optimistic update:', { id, data });
        console.log('updateEquipment - current state before optimistic update:', state);
        
        const newState = state.map(item => 
            item.id === id 
                ? { ...item, ...data }
                : item
        );
        
        console.log('updateEquipment - new state after optimistic update:', newState);
        return newState;
    })
    .on(updateEquipmentFx.doneData, (state, response) => {
        console.log('updateEquipmentFx.doneData - response:', response);
        const updatedDevice = response.device;
        if (!updatedDevice || !updatedDevice.id) {
            console.error('Invalid response from server:', response);
            return state;
        }
        
        console.log('updateEquipmentFx.doneData - updating device:', updatedDevice);
        console.log('updateEquipmentFx.doneData - current state before update:', state);
        
        const newState = state.map(item => {
            if (item.id === updatedDevice.id) {
                console.log('updateEquipmentFx.doneData - replacing item:', item, 'with:', updatedDevice);
                return updatedDevice;
            }
            return item;
        });
        
        console.log('updateEquipmentFx.doneData - new state after update:', newState);
        return newState;
    })
    .on(updateEquipmentFx.failData, (state, error) => {
        console.error('Equipment update failed:', error);
        return state;
    });

export const $filterSelect = createStore<SelectItem[]>(items);
export const $chosenFilter = createStore<SelectItem>(items[0])
    .on(setFilter, (_, filter) => filter);