import { exportEqupment } from '@/shared/lib/export-equipment';
import { printEqupment } from '@/shared/lib/print-equipment';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';

import { $items } from '../../model';

export const FileInteraction = () => {
  const equpmentList = useUnit($items);

  return (
    <Container>
      <ActionButton onClick={() => exportEqupment(equpmentList)}>
        <ExportIcon />
        Экспорт
      </ActionButton>
      <ActionButton onClick={() => printEqupment(equpmentList)}>
        <PrintIcon />
        Печать
      </ActionButton>
    </Container>
  );
};

// SVG иконки
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

const Container = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const ActionButton = styled('button', {
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
    color: '#334155',
  },
  
  '&:active': {
    transform: 'translateY(1px)',
  },
  
  '& svg': {
    width: '16px',
    height: '16px',
  },
});
