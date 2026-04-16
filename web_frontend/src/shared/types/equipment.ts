export type SNMPConfig = {
  id?: number;
  device_id: number;
  enabled: boolean;
  ip_address: string;
  port: number;
  community: string;
  version: string;
  status?: 'up' | 'down' | 'unknown' | 'disabled';
  response_time?: number | null;
  last_check?: string | null;
};

export type SNMPStatus = {
  status: 'up' | 'down' | 'unknown' | 'disabled' | 'error';
  message: string;
  response_time?: number | null;
  timestamp: string;
  system_info?: Record<string, any>;
};

export type Equipment = {
  name: string;
  category: string;
  categoryIcon?: string; // Иконка категории
  place_id: string; // Название комнаты/помещения
  version: string;
  id: number;
  releaseDate: string; // дата закупки
  softwareStartDate: string; // дата устаревания
  softwareEndDate?: string | null; // дата снятия
  updateDate?: string | null; // дата обновления по
  manufacturer: string;
  xCord: number;
  yCord: number;
  mapId?: number | null;
  snmp_config?: SNMPConfig | null; // SNMP конфигурация
  snmp_status?: SNMPStatus | null; // Текущий SNMP статус
};

export type EquipmentFormData = Omit<Equipment, 'id'> & {
  id?: number;
};

export type DiscoveredDevice = {
  ip: string;
  mac: string;
  name: string;
  description: string;
  manufacturer_guess: string;
  device_type_guess: string;
  uptime: string;
  location: string;
  contact: string;
  community: string;
  snmp_version: string;
  response_time_ms: number;
  has_snmp: boolean;
};

export type DiscoveryResult = {
  discovered: DiscoveredDevice[];
  total_scanned: number;
  total_found: number;
  scan_time: number;
};