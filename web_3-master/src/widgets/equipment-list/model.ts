import { Equipment } from '@/shared/types';
import { SelectItem } from '@/shared/types/select-item';
import { createEvent, createStore } from 'effector';

const items: SelectItem[] = [
  {
    label: 'Все',
    id: 1,
  },
  {
    label: 'Устаревающие',
    id: 2,
  },
  {
    label: 'Устаревшие',
    id: 3,
  },
];

export const setFilter = createEvent<SelectItem>();
export const addItem = createEvent<Equipment>(); // Событие для добавления нового оборудования

export const $items = createStore<Equipment[]>([
{
    id: 1,
    name: 'Router A',
    category: 'router',
    releaseDate: '2022-01-01',
    sowftwareStartDate: '2022-02-01',
    sowftwareEndDate: '2025-12-31',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Server Room',
    xCoord: 10,
    yCoord: 28,
    waveRadius: 20,
    mapId: 1,
  },
  {
    id: 2,
    name: 'Router B',
    category: 'router',
    releaseDate: '2022-01-01',
    sowftwareStartDate: '2022-02-01',
    sowftwareEndDate: '2025-12-31',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Server Room',
    xCoord: 80,
    yCoord: 32,
    waveRadius: 30,
    mapId: 1,
  },
  {
    id: 3,
    name: 'Компьютер',
    category: 'desktop',
    releaseDate: '2021-05-15',
    sowftwareStartDate: '2021-06-01',
    sowftwareEndDate: '2024-03-12',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 52,
    yCoord: 70,
    mapId: 1,
  },
  {
    id: 4,
    name: 'Какая-то вещичка',
    category: 'server',
    releaseDate: '2023-07-05',
    sowftwareStartDate: '2023-07-05',
    sowftwareEndDate: '2024-07-05',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 70,
    yCoord: 70,
    mapId: 1,
  },
  {
    id: 5,
    name: 'Сервер',
    category: 'server',
    releaseDate: '2024-02-10',
    sowftwareStartDate: '2024-02-10',
    sowftwareEndDate: '2025-02-10',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 67,
    yCoord: 85,
    mapId: 2,
  },
  {
    id: 6,
    name: 'Компьютер',
    category: 'desktop',
    releaseDate: '2024-02-11',
    sowftwareStartDate: '2024-02-11',
    sowftwareEndDate: '2025-02-11',
    manufacturer: 'https://www.google.co.uk/',
    place: 'Data Center',
    xCoord: 52,
    yCoord: 70,
    mapId: 2,
  },
]);
$items.on(addItem, (state, item) => [...state, item]);
export const $filterSelect = createStore<SelectItem[]>(items);
export const $chosenFilter = createStore<SelectItem>(
  $filterSelect.getState()[0],
).on(setFilter, (_, filter) => filter);
