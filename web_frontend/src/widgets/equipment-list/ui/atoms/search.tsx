import { IconSearchStroked } from '@consta/icons/IconSearchStroked';
import { TextField } from '@consta/uikit/TextField';
import { styled } from '@stitches/react';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const Search: React.FC<SearchProps> = ({ value, onChange }) => {
  return (
    <Input
      type='text'
      placeholder='Поиск'
      view='clear'
      rightSide={IconSearchStroked}
      value={value}
      onChange={(newValue) => onChange(newValue || '')}
    />
  );
};

const Input = styled(TextField, {
  borderBottom: '1px solid #6b7280',
  '& input': {
    fontSize: '15px',
  },
  '& [class*="TextField-Icon"]': {
    width: '18px',
    height: '18px',
  },
});
