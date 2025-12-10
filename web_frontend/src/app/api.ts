import { Equipment } from '@/shared/types/equipment';

const backendUrl = 'http://localhost:8000';

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
  icon?: string; // ID иконки для отображения
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
  console.log('Attempting to delete category with id:', id);
  
  try {
    const response = await fetch(`${backendUrl}/categories/${id}`, {
      method: 'DELETE',
    });
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Ошибка:', errorData);
      
      // Если это ошибка с привязанными устройствами, бросаем специальную ошибку
      if (response.status === 400 && errorData.detail && typeof errorData.detail === 'object' && errorData.detail.devices) {
        console.log('Found devices in error response:', errorData.detail.devices);
        const error = new Error(errorData.detail.message) as Error & { devices: any[] };
        error.devices = errorData.detail.devices;
        throw error;
      }
      
      throw new Error(`Ошибка удаления категории: ${errorData.detail || 'Неизвестная ошибка'}`);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    // Если это ошибка сети, бросаем её как есть
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Failed to fetch');
    }
    throw error;
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

// API для работы с устройствами
export async function deleteDevice(id: number): Promise<void> {
  const response = await fetch(`${backendUrl}/delete_device/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка удаления устройства: ${errorText}`);
  }
}

export async function deleteDevicesByCategory(categoryId: number): Promise<{message: string, deleted_count: number}> {
  const response = await fetch(`${backendUrl}/delete_devices_by_category/${categoryId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Ошибка:', errorText);
    throw new Error(`Ошибка удаления устройств категории: ${errorText}`);
  }
  return (await response.json()) as {message: string, deleted_count: number};
}

// API для работы с SNMP
import { SNMPConfig, SNMPStatus } from '@/shared/types/equipment';

export async function checkSNMPStatus(deviceId: number): Promise<SNMPStatus> {
  const response = await fetch(`${backendUrl}/snmp/check/${deviceId}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка проверки SNMP: ${errorText}`);
  }
  return (await response.json()) as SNMPStatus;
}

export async function checkAllSNMPDevices(): Promise<{message: string, results: Record<string, SNMPStatus>}> {
  const response = await fetch(`${backendUrl}/snmp/check-all`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка проверки всех устройств: ${errorText}`);
  }
  return (await response.json()) as {message: string, results: Record<string, SNMPStatus>};
}

export async function addSNMPConfig(config: Omit<SNMPConfig, 'id'>): Promise<{message: string, config: SNMPConfig}> {
  const response = await fetch(`${backendUrl}/snmp/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка добавления SNMP конфигурации: ${errorText}`);
  }
  return (await response.json()) as {message: string, config: SNMPConfig};
}

export async function getSNMPStatusSummary(): Promise<{
  total_devices: number;
  snmp_enabled: number;
  snmp_status: { up: number; down: number; unknown: number };
  snmp_coverage: number;
}> {
  const response = await fetch(`${backendUrl}/snmp/status`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка получения статистики SNMP: ${errorText}`);
  }
  return (await response.json());
}

// API для получения оборудования по ID
export async function getEquipmentById(id: number): Promise<Equipment> {
  const response = await fetch(`${backendUrl}/equipment/${id}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка загрузки оборудования: ${errorText}`);
  }
  return (await response.json()) as Equipment;
}

// API для получения QR кода оборудования
export function getEquipmentQRCodeUrl(id: number): string {
  return `${backendUrl}/equipment/${id}/qr`;
}