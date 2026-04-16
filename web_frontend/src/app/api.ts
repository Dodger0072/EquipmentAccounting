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

// API для работы с картами (places)
export interface Place {
  id: number;
  name: string;
}

export async function getPlaces(): Promise<Place[]> {
  const response = await fetch(`${backendUrl}/places`);
  if (!response.ok) throw new Error('Ошибка загрузки карт');
  return (await response.json()) as Place[];
}

// API для работы с аудиториями
export interface Classroom {
  id: number;
  name: string;
  map_id: number;
  polygon_coordinates: Array<{ x: number; y: number }>;
  description?: string;
}

export async function getClassrooms(): Promise<Classroom[]> {
  const response = await fetch(`${backendUrl}/classrooms`);
  if (!response.ok) throw new Error('Ошибка загрузки аудиторий');
  return (await response.json()) as Classroom[];
}

export async function getClassroomsByMap(mapId: number): Promise<Classroom[]> {
  const response = await fetch(`${backendUrl}/classrooms/map/${mapId}`);
  if (!response.ok) throw new Error('Ошибка загрузки аудиторий для карты');
  return (await response.json()) as Classroom[];
}

export async function findClassroomByPoint(mapId: number, x: number, y: number): Promise<{ classroom: Classroom | null }> {
  const response = await fetch(`${backendUrl}/classrooms/find-by-point?map_id=${mapId}&x=${x}&y=${y}`);
  if (!response.ok) throw new Error('Ошибка поиска аудитории');
  return (await response.json()) as { classroom: Classroom | null };
}

export async function addClassroom(data: Omit<Classroom, 'id'>): Promise<Classroom> {
  const response = await fetch(`${backendUrl}/classrooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка добавления аудитории: ${errorText}`);
  }
  return (await response.json()) as Classroom;
}

export async function updateClassroom(id: number, data: Partial<Classroom>): Promise<Classroom> {
  const response = await fetch(`${backendUrl}/classrooms/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка обновления аудитории: ${errorText}`);
  }
  return (await response.json()) as Classroom;
}

export async function deleteClassroom(id: number): Promise<void> {
  console.log('Attempting to delete classroom with id:', id);
  console.log('URL:', `${backendUrl}/classrooms/${id}`);
  
  try {
    const response = await fetch(`${backendUrl}/classrooms/${id}`, {
      method: 'DELETE',
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Проверяем успешный ответ
    if (response.ok) {
      // Для DELETE запросов может не быть тела ответа, это нормально
      try {
        const data = await response.json();
        console.log('Response data:', data);
      } catch (e) {
        // Если нет JSON, это нормально для DELETE
        console.log('No response body (normal for DELETE)');
      }
      return; // Успешное удаление
    }
    
    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        console.log('Response text:', text);
        errorData = JSON.parse(text);
        console.error('Error data:', errorData);
      } catch (e) {
        console.error('Failed to parse error response:', e);
        throw new Error(`Ошибка удаления аудитории: HTTP ${response.status}`);
      }
      
      // Если это ошибка с привязанными устройствами, бросаем специальную ошибку
      if (response.status === 400 && errorData.detail && typeof errorData.detail === 'object' && errorData.detail.devices) {
        console.log('Found devices in error response:', errorData.detail.devices);
        const error = new Error(errorData.detail.message) as Error & { devices: any[] };
        error.devices = errorData.detail.devices;
        throw error;
      }
      
      const errorMessage = typeof errorData.detail === 'string' 
        ? errorData.detail 
        : errorData.detail?.message || 'Неизвестная ошибка';
      throw new Error(`Ошибка удаления аудитории: ${errorMessage}`);
    }
    
    console.log('Classroom deleted successfully');
  } catch (error) {
    console.error('Fetch error:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // Если это ошибка сети, бросаем её как есть
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed') || error.message.includes('NetworkError'))) {
      throw new Error('Failed to fetch');
    }
    throw error;
  }
}