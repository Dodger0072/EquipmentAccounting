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
};

export type EquipmentFormData = Omit<Equipment, 'id'> & {
  id?: number;
};