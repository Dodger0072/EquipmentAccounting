import { useState, useEffect } from 'react';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Search } from '../atoms';
import { FileInteraction, ColumnSettings } from '../molecules';
import { fetchCategoriesFx, $equipmentCategories } from '../../model';
import { getClassrooms, Classroom, getPlaces, Place } from '@/app/api';
import { ColumnKey } from '@/shared/config';
import { $role } from '@/shared/auth';

interface FilterProps {
  onSearch: (searchTerm: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onEquipmentCategoryChange: (categoryName: string | null) => void;
  onFloorChange: (floor: string | null) => void;
  onClassroomChange: (classroomName: string | null) => void;
  onAddEquipment: () => void;
  onQRPrint: () => void;
  onDiscoverDevices: () => void;
  visibleColumns: ColumnKey[];
  onColumnsChange: (columns: ColumnKey[]) => void;
}

export const Filter: React.FC<FilterProps> = ({ 
  onSearch, 
  onCategoryChange, 
  onEquipmentCategoryChange,
  onFloorChange,
  onClassroomChange,
  onAddEquipment,
  onQRPrint,
  onDiscoverDevices,
  visibleColumns,
  onColumnsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
  const [selectedStatusCategory, setSelectedStatusCategory] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const categories = useUnit($equipmentCategories);
  const role = useUnit($role);

  useEffect(() => {
    fetchCategoriesFx();
    const loadData = async () => {
      try {
        const [cls, pls] = await Promise.all([
          getClassrooms(),
          getPlaces()
        ]);
        setAllClassrooms(cls);
        setPlaces(pls);
        console.log('Загружены места:', pls);
        console.log('Загружены аудитории:', cls);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      }
    };
    loadData();
  }, []);

  const filteredClassrooms = selectedFloor 
    ? allClassrooms.filter(classroom => {
        const floorMapId = parseInt(selectedFloor);
        return classroom.map_id === floorMapId;
      })
    : allClassrooms;

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm);
  };

  const handleEquipmentCategoryChange = (categoryName: string | null) => {
    const normalizedCategory = categoryName === '' ? null : categoryName;
    setSelectedEquipmentCategory(normalizedCategory);
    onEquipmentCategoryChange(normalizedCategory);
  };

  const handleStatusCategoryChange = (categoryId: number | null) => {
    setSelectedStatusCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const handleFloorChange = (floor: string | null) => {
    setSelectedFloor(floor);
    onFloorChange(floor);
    if (floor !== selectedFloor) {
      setSelectedClassroom(null);
      onClassroomChange(null);
    }
  };

  const handleClassroomChange = (classroomName: string | null) => {
    setSelectedClassroom(classroomName);
    onClassroomChange(classroomName);
  };

  const clearAllFilters = () => {
    setSelectedEquipmentCategory(null);
    setSelectedStatusCategory(null);
    setSelectedFloor(null);
    setSelectedClassroom(null);
    onEquipmentCategoryChange(null);
    onCategoryChange(null);
    onFloorChange(null);
    onClassroomChange(null);
  };

  const hasActiveFilters = selectedEquipmentCategory || selectedStatusCategory || selectedFloor || selectedClassroom;

  return (
    <Container>
      <SearchContainer>
        <Search value={searchTerm} onChange={handleSearchChange} />
      </SearchContainer>
      
      <FilterSection>
        <FilterButton onClick={() => setIsFilterOpen(!isFilterOpen)}>
          <FilterIcon />
          Фильтры {hasActiveFilters && <ActiveIndicator />}
          <Arrow isOpen={isFilterOpen}>▼</Arrow>
        </FilterButton>
        
        {isFilterOpen && (
          <FilterDropdown>
            <FilterGroup>
              <FilterLabel>Категория оборудования:</FilterLabel>
              <FilterSelect
                value={selectedEquipmentCategory || ''}
                onChange={(e) => handleEquipmentCategoryChange(e.target.value)}
              >
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Статус:</FilterLabel>
              <FilterSelect
                value={selectedStatusCategory?.toString() || ''}
                onChange={(e) => handleStatusCategoryChange(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Все</option>
                <option value="2">Устаревающие</option>
                <option value="3">Устаревшие</option>
              </FilterSelect>
            </FilterGroup>

                   <FilterGroup>
                     <FilterLabel>Этаж:</FilterLabel>
                     <FilterSelect
                       value={selectedFloor || ''}
                       onChange={(e) => handleFloorChange(e.target.value || null)}
                     >
                       <option value="">Все этажи</option>
                       {places.map(place => (
                         <option key={place.id} value={place.id.toString()}>
                           {place.name}
                         </option>
                       ))}
                     </FilterSelect>
                   </FilterGroup>

                   <FilterGroup>
                     <FilterLabel>Аудитория:</FilterLabel>
                     <FilterSelect
                       value={selectedClassroom || ''}
                       onChange={(e) => handleClassroomChange(e.target.value || null)}
                       disabled={!selectedFloor}
                     >
                       <option value="">
                         {selectedFloor ? 'Все аудитории' : 'Сначала выберите этаж'}
                       </option>
                       {filteredClassrooms.map(classroom => (
                         <option key={classroom.id} value={classroom.name}>
                           {classroom.name}
                         </option>
                       ))}
                     </FilterSelect>
                   </FilterGroup>

            <FilterActions>
              <ClearButton onClick={clearAllFilters}>
                Сбросить все
              </ClearButton>
            </FilterActions>
          </FilterDropdown>
        )}
      </FilterSection>

      {role !== 'student' && <ColumnSettings visibleColumns={visibleColumns} onChange={onColumnsChange} />}

      {role !== 'student' && <FileInteraction onQRPrint={onQRPrint} />}

      {role !== 'student' && (
        <AddEquipmentButton onClick={onAddEquipment}>
          <AddIcon />
          Добавить оборудование
        </AddEquipmentButton>
      )}

      {role === 'admin' && (
        <DiscoverButton onClick={onDiscoverDevices}>
          <DiscoverIcon />
          Поиск устройств
        </DiscoverButton>
      )}
    </Container>
  );
};

const Container = styled('div', {
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
});

const SearchContainer = styled('div', {
  flex: '0 1 auto',
  width: '220px',
  minWidth: '160px',
});

const FilterSection = styled('div', {
  position: 'relative',
});

const FilterButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '500',
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
  
  '& svg': {
    width: '18px',
    height: '18px',
  },
});

const ActiveIndicator = styled('div', {
  width: '8px',
  height: '8px',
  backgroundColor: '#3b82f6',
  borderRadius: '50%',
});

const Arrow = styled('span', {
  fontSize: '14px',
  transition: 'transform 0.2s ease',
  transform: (props: { isOpen: boolean }) => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
});

const FilterDropdown = styled('div', {
  position: 'absolute',
  top: '100%',
  left: '0',
  right: '0',
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  padding: '18px',
  marginTop: '4px',
  zIndex: 1000,
  minWidth: '300px',
});

const FilterGroup = styled('div', {
  marginBottom: '16px',
  
  '&:last-of-type': {
    marginBottom: '0',
  },
});

const FilterLabel = styled('label', {
  display: 'block',
  fontSize: '16px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '6px',
});

const FilterSelect = styled('select', {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '15px',
  backgroundColor: 'white',
  cursor: 'pointer',
  
  '&:focus': {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
});

const FilterActions = styled('div', {
  paddingTop: '16px',
  borderTop: '1px solid #e5e7eb',
  marginTop: '16px',
});

const ClearButton = styled('button', {
  padding: '8px 14px',
  backgroundColor: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '15px',
  color: '#6b7280',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af',
  },
});

const AddEquipmentButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  backgroundColor: '#3b82f6',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: '500',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  
  '&:hover': {
    backgroundColor: '#2563eb',
  },
  
  '&:active': {
    transform: 'translateY(1px)',
  },
  
  '& svg': {
    width: '18px',
    height: '18px',
  },
});

const AddIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const DiscoverButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 18px',
  backgroundColor: '#8b5cf6',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: '500',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',

  '&:hover': {
    backgroundColor: '#7c3aed',
  },

  '&:active': {
    transform: 'translateY(1px)',
  },

  '& svg': {
    width: '18px',
    height: '18px',
  },
});

const DiscoverIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
  </svg>
);
