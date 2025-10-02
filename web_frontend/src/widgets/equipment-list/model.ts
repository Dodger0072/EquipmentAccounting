// src/widgets/equipment-list/model/index.ts

import { Equipment } from '@/shared/types';
import { SelectItem } from '@/shared/types/select-item';
import { createEvent, createStore, createEffect } from 'effector';
import axios from 'axios';
import { updateEquipmentFx } from '@/features/equipment/model/updateEquipmentFx'; // <-- Импортируем эффект обновления

export const addEquipment = createEvent<Equipment>();
export const setFilter = createEvent<SelectItem>();
export const deleteEquipment = createEvent<number>();

export const fetchEquipmentFx = createEffect(async () => {
    const response = await axios.get('http://localhost:8000/search');
    return response.data.devices; // Убедитесь, что ваш бэкенд возвращает список в поле 'devices'
});

export const updateEquipment = createEvent<Equipment>(); // Это событие для оптимистичного обновления (опционально)

const items: SelectItem[] = [
    { label: 'Все', id: 1, value: 'all' },
    { label: 'Устаревающие', id: 2, value: 'outdated-soon' },
    { label: 'Устаревшие', id: 3, value: 'outdated' },
];

// Добавляем эффект для загрузки категорий
export const fetchCategoriesFx = createEffect(async () => {
    const response = await axios.get('http://localhost:8000/categories');
    return response.data;
});

// Стор для категорий оборудования
export const $equipmentCategories = createStore<any[]>([])
    .on(fetchCategoriesFx.doneData, (_, categories) => categories);

export const $items = createStore<Equipment[]>([])
    .on(
        addEquipment,
        (state, newItem) => [...state, newItem]
    )
    .on(
        fetchEquipmentFx.doneData, (_, items) => items // Обновляем стор данными из fetch
    )
    .on(
        deleteEquipment, (state, id) => state.filter(item => item.id !== id)
    )
    .on(
        updateEquipment, (state, updatedItem) => // Это для оптимистичного обновления (сразу после отправки, до ответа сервера)
        state.map(item => (item.id === updatedItem.id ? updatedItem : item))
    )
    // --- КРИТИЧНО: ДОБАВЬТЕ ЭТОТ ОБРАБОТЧИК ДЛЯ updateEquipmentFx.doneData ---
    .on(
        updateEquipmentFx.doneData, (state, payload) => {
            // Payload - это то, что вернул ваш бэкенд после PUT запроса,
            // т.е. { message: 'Device 8 обновлён', device: { ... } }
            const updatedDeviceFromServer = payload.device; // Предполагаем, что бэкенд возвращает объект в поле 'device'
            if (!updatedDeviceFromServer || !updatedDeviceFromServer.id) {
                console.error("updateEquipmentFx.doneData payload.device is undefined or missing ID. Check backend response.");
                return state; // Возвращаем текущее состояние, если нет данных
            }
            return state.map(item =>
                item.id === updatedDeviceFromServer.id ? updatedDeviceFromServer : item
            );
        }
    );

export const $filterSelect = createStore<SelectItem[]>(items);
export const $chosenFilter = createStore<SelectItem>(items[0]).on(setFilter, (_, filter) => filter);