export type ColumnKey =
  | 'actions'
  | 'number'
  | 'name'
  | 'category'
  | 'releaseDate'
  | 'softwareStartDate'
  | 'softwareEndDate'
  | 'updateDate'
  | 'manufacturer'
  | 'place_id'
  | 'version';

export type ColumnConfig = {
  key: ColumnKey;
  label: string;
  width: string;
  defaultVisible: boolean;
  alwaysVisible?: boolean;
};

export const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'actions', label: 'Действия', width: '64px', defaultVisible: true, alwaysVisible: true },
  { key: 'number', label: '№', width: '40px', defaultVisible: true, alwaysVisible: true },
  { key: 'name', label: 'Название', width: 'minmax(120px, 200px)', defaultVisible: true },
  { key: 'category', label: 'Категория', width: 'minmax(100px, 140px)', defaultVisible: false },
  { key: 'releaseDate', label: 'Дата закупки', width: '105px', defaultVisible: true },
  { key: 'softwareStartDate', label: 'Дата устаревания', width: '115px', defaultVisible: true },
  { key: 'softwareEndDate', label: 'Дата снятия', width: '105px', defaultVisible: true },
  { key: 'updateDate', label: 'Дата обновления', width: '115px', defaultVisible: false },
  { key: 'manufacturer', label: 'Производитель', width: 'minmax(100px, 140px)', defaultVisible: true },
  { key: 'place_id', label: 'Место', width: 'minmax(80px, 100px)', defaultVisible: true },
  { key: 'version', label: 'Версия', width: '80px', defaultVisible: false },
];

const STORAGE_KEY = 'equipment-visible-columns';

export function getDefaultVisibleKeys(): ColumnKey[] {
  return ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key);
}

export function loadVisibleColumns(): ColumnKey[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: ColumnKey[] = JSON.parse(stored);
      const alwaysKeys = ALL_COLUMNS.filter((c) => c.alwaysVisible).map((c) => c.key);
      const merged = Array.from(new Set([...alwaysKeys, ...parsed]));
      return merged;
    }
  } catch {
    // ignore
  }
  return getDefaultVisibleKeys();
}

export function saveVisibleColumns(keys: ColumnKey[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function getGridTemplate(visibleKeys: ColumnKey[]): string {
  return ALL_COLUMNS
    .filter((c) => visibleKeys.includes(c.key))
    .map((c) => c.width)
    .join(' ');
}
