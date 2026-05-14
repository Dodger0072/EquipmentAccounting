import { Equipment } from '@/shared/types/equipment';
import { apiClient, API_BASE } from '@/shared/auth';
import { SNMPConfig, SNMPStatus, DiscoveryResult } from '@/shared/types/equipment';

export async function searchEquipment() {
  const { data } = await apiClient.get('/search');
  return data as Equipment[];
}

export async function addDevice(deviceData: Equipment) {
  const { data } = await apiClient.post('/add_device', deviceData);
  return data as Equipment;
}

// API для работы с категориями
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get('/categories');
  return data as Category[];
}

export async function addCategory(catData: Omit<Category, 'id'>): Promise<Category> {
  const { data } = await apiClient.post('/categories', catData);
  return data as Category;
}

export async function updateCategory(id: number, catData: Partial<Category>): Promise<Category> {
  const { data } = await apiClient.put(`/categories/${id}`, catData);
  return data as Category;
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error: any) {
    if (error.response?.status === 400) {
      const detail = error.response.data?.detail;
      if (detail && typeof detail === 'object' && detail.devices) {
        const err = new Error(detail.message) as Error & { devices: any[] };
        err.devices = detail.devices;
        throw err;
      }
      throw new Error(typeof detail === 'string' ? detail : 'Ошибка удаления категории');
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
  const { data } = await apiClient.get('/manufacturers');
  return data as Manufacturer[];
}

export async function getManufacturersByCategory(categoryId: number): Promise<Manufacturer[]> {
  const { data } = await apiClient.get(`/manufacturers/category/${categoryId}`);
  return data as Manufacturer[];
}

export async function addManufacturer(mData: Omit<Manufacturer, 'id' | 'category_name'>): Promise<Manufacturer> {
  const { data } = await apiClient.post('/manufacturers', mData);
  return data as Manufacturer;
}

export async function updateManufacturer(id: number, mData: Partial<Manufacturer>): Promise<Manufacturer> {
  const { data } = await apiClient.put(`/manufacturers/${id}`, mData);
  return data as Manufacturer;
}

export async function deleteManufacturer(id: number): Promise<void> {
  await apiClient.delete(`/manufacturers/${id}`);
}

// API для работы с устройствами
export async function deleteDevice(id: number): Promise<void> {
  await apiClient.delete(`/delete_device/${id}`);
}

export async function deleteDevicesByCategory(categoryId: number): Promise<{ message: string; deleted_count: number }> {
  const { data } = await apiClient.delete(`/delete_devices_by_category/${categoryId}`);
  return data;
}

// API для работы с SNMP
export async function checkSNMPStatus(deviceId: number): Promise<SNMPStatus> {
  const { data } = await apiClient.get(`/snmp/check/${deviceId}`);
  return data as SNMPStatus;
}

export async function checkAllSNMPDevices(): Promise<{ message: string; results: Record<string, SNMPStatus> }> {
  const { data } = await apiClient.get('/snmp/check-all');
  return data;
}

export async function addSNMPConfig(config: Omit<SNMPConfig, 'id'>): Promise<{ message: string; config: SNMPConfig }> {
  const { data } = await apiClient.post('/snmp/config', config);
  return data;
}

export async function getSNMPStatusSummary() {
  const { data } = await apiClient.get('/snmp/status');
  return data;
}

export async function getLocalSubnet(): Promise<{ subnet: string; local_ip: string }> {
  try {
    const { data } = await apiClient.get('/snmp/discover/subnet');
    return data;
  } catch {
    return { subnet: '192.168.0.0/24', local_ip: '' };
  }
}

export async function discoverDevices(
  subnet: string,
  communities: string[] = ['public'],
  timeout: number = 2.0,
  pingTimeoutMs: number = 1200,
): Promise<DiscoveryResult> {
  const { data } = await apiClient.post('/snmp/discover', {
    subnet,
    communities,
    timeout,
    ping_timeout_ms: pingTimeoutMs,
  });
  return data as DiscoveryResult;
}

export async function importDiscoveredDevices(
  devices: Array<Record<string, any>>,
  category: string,
  place_id: string,
  location?: { x: number; y: number; mapId: number },
): Promise<{ imported: Array<{ id: number; name: string; ip: string }>; count: number }> {
  const { data } = await apiClient.post('/snmp/discover/import', {
    devices,
    category,
    place_id,
    xCord: location?.x ?? 0,
    yCord: location?.y ?? 0,
    mapId: location?.mapId ?? null,
  });
  return data;
}

// API для получения оборудования по ID
export async function getEquipmentById(id: number): Promise<Equipment> {
  const { data } = await apiClient.get(`/equipment/${id}`);
  return data as Equipment;
}

// API для получения QR кода оборудования (URL, не запрос)
export function getEquipmentQRCodeUrl(id: number): string {
  return `${API_BASE}/equipment/${id}/qr`;
}

// API для работы с картами (places)
export interface Place {
  id: number;
  name: string;
}

export async function getPlaces(): Promise<Place[]> {
  const { data } = await apiClient.get('/places');
  return data as Place[];
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
  const { data } = await apiClient.get('/classrooms');
  return data as Classroom[];
}

export async function getClassroomsByMap(mapId: number): Promise<Classroom[]> {
  const { data } = await apiClient.get(`/classrooms/map/${mapId}`);
  return data as Classroom[];
}

export async function findClassroomByPoint(mapId: number, x: number, y: number): Promise<{ classroom: Classroom | null }> {
  const { data } = await apiClient.get(`/classrooms/find-by-point?map_id=${mapId}&x=${x}&y=${y}`);
  return data;
}

export async function addClassroom(clsData: Omit<Classroom, 'id'>): Promise<Classroom> {
  const { data } = await apiClient.post('/classrooms', clsData);
  return data as Classroom;
}

export async function updateClassroom(id: number, clsData: Partial<Classroom>): Promise<Classroom> {
  const { data } = await apiClient.put(`/classrooms/${id}`, clsData);
  return data as Classroom;
}

export async function deleteClassroom(id: number): Promise<void> {
  try {
    await apiClient.delete(`/classrooms/${id}`);
  } catch (error: any) {
    if (error.response?.status === 400) {
      const detail = error.response.data?.detail;
      if (detail && typeof detail === 'object' && detail.devices) {
        const err = new Error(detail.message) as Error & { devices: any[] };
        err.devices = detail.devices;
        throw err;
      }
      const errorMessage = typeof detail === 'string' ? detail : detail?.message || 'Неизвестная ошибка';
      throw new Error(`Ошибка удаления аудитории: ${errorMessage}`);
    }
    throw error;
  }
}
