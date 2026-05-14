import { useState, useRef, useEffect } from 'react';
import { exportEqupment } from '@/shared/lib/export-equipment';
import { printEqupment } from '@/shared/lib/print-equipment';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { $items } from '../../model';

interface FileInteractionProps {
  onQRPrint?: () => void;
}

export const FileInteraction: React.FC<FileInteractionProps> = ({ onQRPrint }) => {
  const equpmentList = useUnit($items);
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

  return (
    <Wrapper ref={ref}>
      <ToggleButton onClick={() => setIsOpen(!isOpen)}>
        <ExportMainIcon />
        Экспорт
        <Arrow style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</Arrow>
      </ToggleButton>

      {isOpen && (
        <Dropdown>
          <DropdownItem onClick={() => { exportEqupment(equpmentList); setIsOpen(false); }}>
            <ExportIcon />
            Экспорт в файл
          </DropdownItem>
          <DropdownItem onClick={() => { printEqupment(equpmentList); setIsOpen(false); }}>
            <PrintIcon />
            Печать таблицы
          </DropdownItem>
          {onQRPrint && (
            <DropdownItem onClick={() => { onQRPrint(); setIsOpen(false); }}>
              <QRIcon />
              Печать QR кодов
            </DropdownItem>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};

const ExportMainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 6,2 18,2 18,9"/>
    <path d="M6,18H4a2,2 0 0,1 -2,-2v-5a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const QRIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="17" y="17" width="4" height="4" />
    <line x1="14" y1="14" x2="14" y2="14.01" />
    <line x1="21" y1="14" x2="21" y2="14.01" />
    <line x1="14" y1="21" x2="14" y2="21.01" />
  </svg>
);

const Wrapper = styled('div', {
  position: 'relative',
});

const ToggleButton = styled('button', {
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

const Arrow = styled('span', {
  fontSize: '14px',
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
  padding: '4px 0',
  marginTop: '4px',
  zIndex: 1000,
  minWidth: '180px',
});

const DropdownItem = styled('button', {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'transparent',
  border: 'none',
  fontSize: '15px',
  color: '#374151',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',
  whiteSpace: 'nowrap',

  '&:hover': {
    backgroundColor: '#f1f5f9',
  },

  '& svg': {
    width: '18px',
    height: '18px',
    color: '#6b7280',
    flexShrink: 0,
  },
});
