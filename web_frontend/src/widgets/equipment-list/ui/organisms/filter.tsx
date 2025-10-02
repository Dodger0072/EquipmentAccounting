import { useState, useEffect } from 'react';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Search } from '../atoms';
import { FileInteraction } from '../molecules';
import { fetchCategoriesFx, $equipmentCategories } from '../../model';

interface FilterProps {
  onSearch: (searchTerm: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onEquipmentCategoryChange: (categoryName: string | null) => void;
  onFloorChange: (floor: string | null) => void;
}

export const Filter: React.FC<FilterProps> = ({ 
  onSearch, 
  onCategoryChange, 
  onEquipmentCategoryChange,
  onFloorChange 
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
  const [selectedStatusCategory, setSelectedStatusCategory] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const categories = useUnit($equipmentCategories);

  useEffect(() => {
    fetchCategoriesFx();
  }, []);

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm);
  };

  const handleEquipmentCategoryChange = (categoryName: string | null) => {
    setSelectedEquipmentCategory(categoryName);
    onEquipmentCategoryChange(categoryName);
  };

  const handleStatusCategoryChange = (categoryId: number | null) => {
    setSelectedStatusCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const handleFloorChange = (floor: string | null) => {
    setSelectedFloor(floor);
    onFloorChange(floor);
  };

  const clearAllFilters = () => {
    setSelectedEquipmentCategory(null);
    setSelectedStatusCategory(null);
    setSelectedFloor(null);
    onEquipmentCategoryChange(null);
    onCategoryChange(null);
    onFloorChange(null);
  };

  const hasActiveFilters = selectedEquipmentCategory || selectedStatusCategory || selectedFloor;

  return (
    <Container>
      <Search value={searchTerm} onChange={handleSearchChange} />
      
      <FilterSection>
        <FilterButton onClick={() => setIsFilterOpen(!isFilterOpen)}>
          Фильтры {hasActiveFilters && <ActiveIndicator />}
          <Arrow isOpen={isFilterOpen}>▼</Arrow>
        </FilterButton>
        
        {isFilterOpen && (
          <FilterDropdown>
            <FilterGroup>
              <FilterLabel>Категория оборудования:</FilterLabel>
              <FilterSelect
                value={selectedEquipmentCategory || ''}
                onChange={(e) => handleEquipmentCategoryChange(e.target.value || null)}
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
                     <FilterLabel>Место:</FilterLabel>
                     <FilterSelect
                       value={selectedFloor || ''}
                       onChange={(e) => handleFloorChange(e.target.value || null)}
                     >
                       <option value="">Все места</option>
                       <option value="Admin Room">Admin Room</option>
                       <option value="Server Room">Server Room</option>
                       <option value="Office 1">Office 1</option>
                       <option value="Office 2">Office 2</option>
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

      <FileInteraction />
    </Container>
  );
};

const Container = styled('div', {
  marginBottom: '32px',
  display: 'grid',
  gridTemplateColumns: '2fr 1fr 1fr',
  gap: '16px',
  alignItems: 'start',
});

const FilterSection = styled('div', {
  position: 'relative',
});

const FilterButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 16px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
  },
});

const ActiveIndicator = styled('div', {
  width: '8px',
  height: '8px',
  backgroundColor: '#3b82f6',
  borderRadius: '50%',
});

const Arrow = styled('span', {
  fontSize: '12px',
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
  padding: '16px',
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
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
  marginBottom: '6px',
});

const FilterSelect = styled('select', {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
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
  padding: '6px 12px',
  backgroundColor: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  color: '#6b7280',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af',
  },
});
