import { Equipment } from '@/shared/types/equipment';

const backendUrl = 'http://127.0.0.1:8000';

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

// API для работы с категориями
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${backendUrl}/categories`);
  if (!response.ok) throw new Error('Ошибка загрузки категорий');
  return (await response.json()) as Category[];
}

export async function addCategory(data: Omit<Category, 'id'>): Promise<Category> {
  const response = await fetch(`${backendUrl}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка добавления категории: ${errorText}`);
  }
  return (await response.json()) as Category;
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const response = await fetch(`${backendUrl}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка обновления категории: ${errorText}`);
  }
  return (await response.json()) as Category;
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${backendUrl}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка удаления категории: ${errorText}`);
  }
}

// API для работы с производителями
export interface Manufacturer {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  category_name?: string;
}

export async function getManufacturers(): Promise<Manufacturer[]> {
  const response = await fetch(`${backendUrl}/manufacturers`);
  if (!response.ok) throw new Error('Ошибка загрузки производителей');
  return (await response.json()) as Manufacturer[];
}

export async function getManufacturersByCategory(categoryId: number): Promise<Manufacturer[]> {
  const response = await fetch(`${backendUrl}/manufacturers/category/${categoryId}`);
  if (!response.ok) throw new Error('Ошибка загрузки производителей по категории');
  return (await response.json()) as Manufacturer[];
}

export async function addManufacturer(data: Omit<Manufacturer, 'id' | 'category_name'>): Promise<Manufacturer> {
  const response = await fetch(`${backendUrl}/manufacturers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка добавления производителя: ${errorText}`);
  }
  return (await response.json()) as Manufacturer;
}

export async function updateManufacturer(id: number, data: Partial<Manufacturer>): Promise<Manufacturer> {
  const response = await fetch(`${backendUrl}/manufacturers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка обновления производителя: ${errorText}`);
  }
  return (await response.json()) as Manufacturer;
}

export async function deleteManufacturer(id: number): Promise<void> {
  const response = await fetch(`${backendUrl}/manufacturers/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка удаления производителя: ${errorText}`);
  }
}