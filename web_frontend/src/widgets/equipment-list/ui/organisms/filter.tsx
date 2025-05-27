import { useState } from 'react';
import { styled } from '@stitches/react';
import { Search } from '../atoms';
import { Category } from '../atoms/category';
import { FileInteraction } from '../molecules';

interface FilterProps {
  onSearch: (searchTerm: string) => void;
  onCategoryChange: (categoryId: number | null) => void; // Изменено на number
}

export const Filter: React.FC<FilterProps> = ({ onSearch, onCategoryChange }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    onSearch(newSearchTerm);
  };

  return (
    <Container>
      <Search value={searchTerm} onChange={handleSearchChange} />
      <FileInteraction />
      <Category onChange={onCategoryChange} /> {/* Передаем функцию */}
    </Container>
  );
};

const Container = styled('div', {
  marginBottom: '32px',
  display: 'grid',
  gridTemplateColumns: '3fr 1fr 1fr',
  gap: '20%',
});
