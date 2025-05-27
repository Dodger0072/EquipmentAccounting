import { Equipment } from '@/shared/types/equipment';

const backendUrl = '/api';

export async function searchEquipment() {
  const response = await fetch(`${backendUrl}/search`);
  if (!response.ok) throw new Error('Ошибка загрузки оборудования');
  return (await response.json()) as Equipment[];
}

export async function addDevice(data: Equipment) {
  const response = await fetch(`${backendUrl}/add_device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка добавления оборудования: ${errorText}`);
  }

  return (await response.json()) as Equipment;
}