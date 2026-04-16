import { useState, useRef, useEffect } from 'react';
import { styled } from '@stitches/react';
import { ALL_COLUMNS, ColumnKey, getDefaultVisibleKeys } from '@/shared/config';

interface ColumnSettingsProps {
  visibleColumns: ColumnKey[];
  onChange: (columns: ColumnKey[]) => void;
}

export const ColumnSettings: React.FC<ColumnSettingsProps> = ({ visibleColumns, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (key: ColumnKey) => {
    const col = ALL_COLUMNS.find((c) => c.key === key);
    if (col?.alwaysVisible) return;

    if (visibleColumns.includes(key)) {
      onChange(visibleColumns.filter((k) => k !== key));
    } else {
      const ordered = ALL_COLUMNS.filter(
        (c) => visibleColumns.includes(c.key) || c.key === key
      ).map((c) => c.key);
      onChange(ordered);
    }
  };

  const resetToDefault = () => {
    onChange(getDefaultVisibleKeys());
  };

  const selectAll = () => {
    onChange(ALL_COLUMNS.map((c) => c.key));
  };

  const configurableColumns = ALL_COLUMNS.filter((c) => !c.alwaysVisible);

  return (
    <Wrapper ref={ref}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)}>
        <ColumnsIcon />
        Столбцы
        <Arrow style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</Arrow>
      </ToggleButton>

      {isOpen && (
        <Dropdown>
          <DropdownHeader>Отображаемые столбцы</DropdownHeader>
          <ColumnList>
            {configurableColumns.map((col) => {
              const checked = visibleColumns.includes(col.key);
              return (
                <ColumnItem key={col.key} onClick={() => toggleColumn(col.key)}>
                  <Checkbox checked={checked}>
                    {checked && <CheckIcon />}
                  </Checkbox>
                  <ColumnLabel>{col.label}</ColumnLabel>
                </ColumnItem>
              );
            })}
          </ColumnList>
          <DropdownActions>
            <ActionButton onClick={selectAll}>Показать все</ActionButton>
            <ActionButton onClick={resetToDefault}>По умолчанию</ActionButton>
          </DropdownActions>
        </Dropdown>
      )}
    </Wrapper>
  );
};

const ColumnsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="18" rx="1" />
    <rect x="14" y="3" width="7" height="18" rx="1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const Wrapper = styled('div', {
  position: 'relative',
});

const ToggleButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
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
    width: '16px',
    height: '16px',
  },
});

const Arrow = styled('span', {
  fontSize: '12px',
  transition: 'transform 0.2s ease',
});

const Dropdown = styled('div', {
  position: 'absolute',
  top: '100%',
  left: '0',
  backgroundColor: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  padding: '12px 0',
  marginTop: '4px',
  zIndex: 1000,
  minWidth: '240px',
});

const DropdownHeader = styled('div', {
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  padding: '0 16px 10px',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '4px',
});

const ColumnList = styled('div', {
  display: 'flex',
  flexDirection: 'column',
});

const ColumnItem = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 16px',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',

  '&:hover': {
    backgroundColor: '#f1f5f9',
  },
});

const Checkbox = styled('div', {
  width: '18px',
  height: '18px',
  borderRadius: '4px',
  border: '2px solid #d1d5db',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
  flexShrink: 0,

  variants: {
    checked: {
      true: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
      },
      false: {
        backgroundColor: 'white',
        borderColor: '#d1d5db',
      },
    },
  },
});

const ColumnLabel = styled('span', {
  fontSize: '14px',
  color: '#374151',
  userSelect: 'none',
});

const DropdownActions = styled('div', {
  display: 'flex',
  gap: '8px',
  padding: '10px 16px 0',
  borderTop: '1px solid #e5e7eb',
  marginTop: '4px',
});

const ActionButton = styled('button', {
  padding: '6px 12px',
  backgroundColor: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#6b7280',
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  '&:hover': {
    backgroundColor: '#f9fafb',
    borderColor: '#9ca3af',
  },
});
