import { Equipment } from '../types';

export const exportEqupment = (equipmentList: Equipment[]) => {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    'id,name,category,releaseDate,softwareStartDate,softwareEndDate,manufacturer,place,xCoord,yCoord,waveRadius\n' +
    equipmentList
      .map(
        (equipment) =>
          `${equipment.id},${equipment.name},${equipment.category},${equipment.releaseDate},${equipment.softwareStartDate},${equipment.softwareEndDate},${equipment.manufacturer},${equipment.place_id},${equipment.xCord},${equipment.yCord},${equipment.waveRadius || ''}`,
      )
      .join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'equipment.csv');
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
};
