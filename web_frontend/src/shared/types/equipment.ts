export type Equipment = {
  name: string;
  category: string;
  place_id: string;
  version?: string | null ;
  id: number;
  releaseDate: string;
  softwareStartDate: string;
  softwareEndDate: string;
  manufacturer: string;
  xCord: number;
  yCord: number;
  waveRadius?: number | null;
  mapId?: number | null;
};