export type Equipment = {
  name: string;
  category: string;
  place_id: string; // Название комнаты/помещения
  version: string;
  id: number;
  releaseDate: string; // дата закупки
  softwareStartDate: string; // дата устаревания
  softwareEndDate?: string; // дата снятия
  updateDate?: string; // дата обновления по
  manufacturer: string;
  xCord: number;
  yCord: number;
  waveRadius?: number | null;
  mapId?: number | null;
};