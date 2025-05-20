export type Equipment = {
  id: number;
  name: string;
  category: string;
  releaseDate: string;
  sowftwareStartDate: string;
  sowftwareEndDate: string;
  manufacturer: string;
  place: string; // В бд будут лежать "места" - элементы таблицы, в которых лежит карта (изображение), и к которым привязано оборудование
  xCoord: number; // Координаты на "месте". Должны храниться в виде процентов от верхнего левого угла, либо подобным способом, для достижения адаптивности карты
  yCoord: number;
  waveRadius?: number; // Радиус сигнала, имеется не у всего оборудования
};
