import { Equipment } from '../types';

export const printEqupment = (equipmentList: Equipment[]) => {
  let tableContent = '<table style="border-collapse: collapse; width: 100%;">';
  tableContent +=
    '<thead><tr><th style="padding: 8px; border: 1px solid #ddd;">ID</th><th style="padding: 8px; border: 1px solid #ddd;">Name</th><th style="padding: 8px; border: 1px solid #ddd;">Category</th><th style="padding: 8px; border: 1px solid #ddd;">Release Date</th><th style="padding: 8px; border: 1px solid #ddd;">Software Start Date</th><th style="padding: 8px; border: 1px solid #ddd;">Software End Date</th><th style="padding: 8px; border: 1px solid #ddd;">Manufacturer</th><th style="padding: 8px; border: 1px solid #ddd;">Place</th><th style="padding: 8px; border: 1px solid #ddd;">Wave Radius</th></tr></thead>';
  tableContent += '<tbody>';
  equipmentList.forEach((equipment) => {
    tableContent += `<tr><td style="padding: 8px; border: 1px solid #ddd;">${equipment.id}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.name}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.category}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.releaseDate}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.sowftwareStartDate}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.sowftwareEndDate}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.manufacturer}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.place}</td><td style="padding: 8px; border: 1px solid #ddd;">${equipment.waveRadius || ''}</td></tr>`;
  });
  tableContent += '</tbody>';
  tableContent += '</table>';

  // Создаем новое окно с HTML-таблицей
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.body.innerHTML = tableContent;
    newWindow.print();
  }
};
