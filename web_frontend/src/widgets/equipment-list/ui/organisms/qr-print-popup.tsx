import { useState, useMemo } from 'react';
import { styled } from '@stitches/react';
import { Equipment } from '@/shared/types';
import { getEquipmentQRCodeUrl } from '@/app/api';

interface QRPrintPopupProps {
    equipmentList: Equipment[];
    onClose: () => void;
}

type PerPage = 1 | 2 | 4 | 8 | 16;

const PER_PAGE_OPTIONS: { value: PerPage; label: string; cols: number; rows: number }[] = [
    { value: 1,  label: '1 на листе',  cols: 1, rows: 1 },
    { value: 2,  label: '2 на листе',  cols: 1, rows: 2 },
    { value: 4,  label: '4 на листе',  cols: 2, rows: 2 },
    { value: 8,  label: '8 на листе',  cols: 2, rows: 4 },
    { value: 16, label: '16 на листе', cols: 4, rows: 4 },
];

export const QRPrintPopup: React.FC<QRPrintPopupProps> = ({ equipmentList, onClose }) => {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [perPage, setPerPage] = useState<PerPage>(4);
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return equipmentList;
        const q = search.toLowerCase();
        return equipmentList.filter(
            (eq) =>
                eq.name.toLowerCase().includes(q) ||
                eq.category?.toLowerCase().includes(q) ||
                eq.place_id?.toLowerCase().includes(q)
        );
    }, [equipmentList, search]);

    const toggleItem = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds(new Set(filtered.map((eq) => eq.id)));
    };

    const deselectAll = () => {
        setSelectedIds(new Set());
    };

    const selectedEquipment = equipmentList.filter((eq) => selectedIds.has(eq.id));

    const handlePrint = () => {
        if (selectedEquipment.length === 0) return;

        const layout = PER_PAGE_OPTIONS.find((o) => o.value === perPage)!;
        const pages: Equipment[][] = [];
        for (let i = 0; i < selectedEquipment.length; i += perPage) {
            pages.push(selectedEquipment.slice(i, i + perPage));
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const qrSize = perPage <= 2 ? 250 : perPage <= 4 ? 180 : perPage <= 8 ? 140 : 100;
        const fontSize = perPage <= 2 ? 14 : perPage <= 8 ? 11 : 9;

        const pagesHtml = pages
            .map(
                (page) => `
            <div class="page">
                <div class="grid" style="grid-template-columns: repeat(${layout.cols}, 1fr); grid-template-rows: repeat(${layout.rows}, 1fr);">
                    ${page
                        .map(
                            (eq) => `
                        <div class="qr-cell">
                            <img src="${getEquipmentQRCodeUrl(eq.id)}" alt="QR" style="width:${qrSize}px;height:${qrSize}px;" />
                            <div class="qr-name">${eq.name}</div>
                            <div class="qr-info">${eq.place_id || ''}${eq.category ? ' · ' + eq.category : ''}</div>
                            <div class="qr-id">ID: ${eq.id}</div>
                        </div>
                    `
                        )
                        .join('')}
                </div>
            </div>
        `
            )
            .join('');

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
    <title>QR коды оборудования</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        .page {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            page-break-after: always;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .page:last-child { page-break-after: auto; }
        .grid {
            display: grid;
            width: 100%;
            height: 277mm;
            gap: 4mm;
        }
        .qr-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px dashed #ccc;
            border-radius: 4px;
            padding: 4mm;
            text-align: center;
        }
        .qr-cell img { margin-bottom: 4px; }
        .qr-name {
            font-size: ${fontSize}px;
            font-weight: bold;
            margin-top: 2px;
            word-break: break-word;
            max-width: 100%;
        }
        .qr-info {
            font-size: ${Math.max(fontSize - 2, 7)}px;
            color: #666;
            margin-top: 1px;
        }
        .qr-id {
            font-size: ${Math.max(fontSize - 3, 7)}px;
            color: #999;
            margin-top: 1px;
        }
        @media print {
            body { margin: 0; }
            .page { padding: 8mm; }
            .qr-cell { border-color: #ddd; }
            @page { margin: 0; size: A4; }
        }
    </style>
</head>
<body>
    ${pagesHtml}
    <script>
        window.onload = function() { window.print(); };
    </script>
</body>
</html>`);
        printWindow.document.close();
    };

    return (
        <Overlay>
            <Popup>
                <PopupHeader>
                    <PopupTitle>Печать QR кодов</PopupTitle>
                    <CloseIcon onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </CloseIcon>
                </PopupHeader>

                <Section>
                    <SectionLabel>Количество на листе</SectionLabel>
                    <LayoutOptions>
                        {PER_PAGE_OPTIONS.map((opt) => (
                            <LayoutOption
                                key={opt.value}
                                selected={perPage === opt.value}
                                onClick={() => setPerPage(opt.value)}
                            >
                                <LayoutPreview cols={opt.cols} rows={opt.rows}>
                                    {Array.from({ length: opt.value }).map((_, i) => (
                                        <MiniCell key={i} />
                                    ))}
                                </LayoutPreview>
                                <LayoutLabel>{opt.label}</LayoutLabel>
                            </LayoutOption>
                        ))}
                    </LayoutOptions>
                </Section>

                <Section>
                    <SectionLabel>
                        Выберите оборудование
                        <SelectedCount>
                            {selectedIds.size} из {equipmentList.length}
                        </SelectedCount>
                    </SectionLabel>

                    <SearchInput
                        type="text"
                        placeholder="Поиск по названию, категории, месту..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <SelectActions>
                        <SmallButton onClick={selectAll}>Выбрать все</SmallButton>
                        <SmallButton onClick={deselectAll}>Снять все</SmallButton>
                    </SelectActions>

                    <EquipmentList>
                        {filtered.map((eq) => {
                            const checked = selectedIds.has(eq.id);
                            return (
                                <EquipmentRow key={eq.id} onClick={() => toggleItem(eq.id)}>
                                    <Checkbox checked={checked}>
                                        {checked && <CheckIcon />}
                                    </Checkbox>
                                    <EquipmentInfo>
                                        <EquipmentName>{eq.name}</EquipmentName>
                                        <EquipmentMeta>
                                            {eq.category}{eq.place_id ? ` · ${eq.place_id}` : ''}
                                        </EquipmentMeta>
                                    </EquipmentInfo>
                                </EquipmentRow>
                            );
                        })}
                        {filtered.length === 0 && (
                            <EmptyState>Ничего не найдено</EmptyState>
                        )}
                    </EquipmentList>
                </Section>

                <Footer>
                    <FooterInfo>
                        {selectedIds.size > 0
                            ? `${selectedIds.size} QR ${pluralCodes(selectedIds.size)} · ${Math.ceil(selectedIds.size / perPage)} ${pluralPages(Math.ceil(selectedIds.size / perPage))}`
                            : 'Выберите оборудование для печати'}
                    </FooterInfo>
                    <FooterButtons>
                        <CancelButton onClick={onClose}>Отмена</CancelButton>
                        <PrintButton onClick={handlePrint} disabled={selectedIds.size === 0}>
                            <PrintBtnIcon />
                            Печать
                        </PrintButton>
                    </FooterButtons>
                </Footer>
            </Popup>
        </Overlay>
    );
};

function pluralCodes(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'кодов';
    if (mod10 === 1) return 'код';
    if (mod10 >= 2 && mod10 <= 4) return 'кода';
    return 'кодов';
}

function pluralPages(n: number): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return 'листов';
    if (mod10 === 1) return 'лист';
    if (mod10 >= 2 && mod10 <= 4) return 'листа';
    return 'листов';
}

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const PrintBtnIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6,9 6,2 18,2 18,9" />
        <path d="M6,18H4a2,2 0 0,1 -2,-2v-5a2,2 0 0,1 2,-2H20a2,2 0 0,1 2,2v5a2,2 0 0,1 -2,2H18" />
        <rect x="6" y="14" width="12" height="8" />
    </svg>
);

const Overlay = styled('div', {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
});

const Popup = styled('div', {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    width: '560px',
    maxHeight: '90vh',
    overflow: 'hidden',
});

const PopupHeader = styled('div', {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
});

const PopupTitle = styled('h2', {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
});

const CloseIcon = styled('button', {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    '&:hover': {
        backgroundColor: '#f3f4f6',
        color: '#374151',
    },
});

const Section = styled('div', {
    padding: '16px 24px',
    borderBottom: '1px solid #f3f4f6',
});

const SectionLabel = styled('div', {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
});

const SelectedCount = styled('span', {
    fontSize: '13px',
    fontWeight: '400',
    color: '#6b7280',
});

const LayoutOptions = styled('div', {
    display: 'flex',
    gap: '10px',
});

const LayoutOption = styled('button', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    flex: 1,

    '&:hover': {
        borderColor: '#93c5fd',
        backgroundColor: '#f0f7ff',
    },

    variants: {
        selected: {
            true: {
                borderColor: '#3b82f6',
                backgroundColor: '#eff6ff',
            },
        },
    },
});

const LayoutPreview = styled('div', {
    display: 'grid',
    gap: '2px',
    width: '40px',
    height: '52px',
    padding: '3px',
    border: '1px solid #d1d5db',
    borderRadius: '3px',
    backgroundColor: '#f9fafb',
    variants: {
        cols: {
            1: { gridTemplateColumns: '1fr' },
            2: { gridTemplateColumns: '1fr 1fr' },
            4: { gridTemplateColumns: '1fr 1fr 1fr 1fr' },
        },
        rows: {
            1: { gridTemplateRows: '1fr' },
            2: { gridTemplateRows: '1fr 1fr' },
            4: { gridTemplateRows: '1fr 1fr 1fr 1fr' },
        },
    },
});

const MiniCell = styled('div', {
    backgroundColor: '#3b82f6',
    borderRadius: '1px',
    opacity: 0.5,
});

const LayoutLabel = styled('span', {
    fontSize: '12px',
    color: '#475569',
    fontWeight: '500',
    whiteSpace: 'nowrap',
});

const SearchInput = styled('input', {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '8px',
    '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    '&::placeholder': {
        color: '#9ca3af',
    },
});

const SelectActions = styled('div', {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
});

const SmallButton = styled('button', {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
    },
});

const EquipmentList = styled('div', {
    maxHeight: '280px',
    overflowY: 'auto',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
});

const EquipmentRow = styled('div', {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',
    borderBottom: '1px solid #f3f4f6',

    '&:last-child': {
        borderBottom: 'none',
    },

    '&:hover': {
        backgroundColor: '#f8fafc',
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

const EquipmentInfo = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
});

const EquipmentName = styled('span', {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const EquipmentMeta = styled('span', {
    fontSize: '12px',
    color: '#6b7280',
});

const EmptyState = styled('div', {
    padding: '24px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
});

const Footer = styled('div', {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
});

const FooterInfo = styled('span', {
    fontSize: '13px',
    color: '#6b7280',
});

const FooterButtons = styled('div', {
    display: 'flex',
    gap: '10px',
});

const CancelButton = styled('button', {
    padding: '10px 16px',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#f9fafb',
        borderColor: '#9ca3af',
    },
});

const PrintButton = styled('button', {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: '#2563eb',
    },
    '&:active': {
        transform: 'translateY(1px)',
    },
    '&:disabled': {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
        '&:hover': {
            backgroundColor: '#9ca3af',
        },
    },
    '& svg': {
        width: '16px',
        height: '16px',
    },
});
