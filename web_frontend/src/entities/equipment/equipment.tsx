import { Equipment as EquipmentType } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { getType } from '@/shared/lib/get-type';
import { getEquipmentQRCodeUrl } from '@/app/api';

type EquipmentProps = {
    equipment: EquipmentType;
    displayNumber: number;
    onDelete: () => void;
    onEdit: () => void;
};

const getSNMPStatusColor = (status?: string) => {
    switch (status) {
        case 'up':
            return '#10b981'; // green
        case 'down':
            return '#ef4444'; // red
        case 'disabled':
            return '#6b7280'; // gray
        default:
            return '#f59e0b'; // yellow/orange for unknown
    }
};

const getSNMPStatusText = (status?: string) => {
    switch (status) {
        case 'up':
            return 'Работает';
        case 'down':
        case 'error':
            return 'Не отвечает';
        case 'disabled':
            return 'Отключен';
        default:
            return 'Неизвестно';
    }
};

export const Equipment = ({ equipment, displayNumber, onDelete, onEdit }: EquipmentProps) => {
    const type = getType(equipment.softwareEndDate || '');
    // Приоритет: сначала snmp_status (актуальный), потом snmp_config.status (из базы)
    const snmpStatus = equipment.snmp_status?.status || equipment.snmp_config?.status || 'unknown';
    const hasSNMP = equipment.snmp_config?.enabled;
    // Время отклика из актуального статуса или из конфигурации
    const responseTime = equipment.snmp_status?.response_time || equipment.snmp_config?.response_time;
    
    const handlePrintQR = () => {
        const qrUrl = getEquipmentQRCodeUrl(equipment.id);
        
        // Создаем новое окно для печати QR кода
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR код - ${equipment.name}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        padding: 20px;
                    }
                    .qr-container {
                        text-align: center;
                    }
                    .qr-code {
                        margin: 20px 0;
                    }
                    .equipment-name {
                        font-size: 18px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .equipment-id {
                        font-size: 14px;
                        color: #666;
                        margin-top: 10px;
                    }
                    @media print {
                        body {
                            margin: 0;
                        }
                        @page {
                            margin: 20mm;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <div class="equipment-name">${equipment.name}</div>
                    <div class="qr-code">
                        <img src="${qrUrl}" alt="QR код" style="max-width: 300px; height: auto;" />
                    </div>
                    <div class="equipment-id">ID: ${equipment.id}</div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };
    
    return (
        <EquipmentContainer type={type}>
            <ActionButtons>
                <IconButton 
                    onClick={onEdit}
                    title="Редактировать"
                >
                    <EditIcon />
                </IconButton>
                <IconButton 
                    onClick={onDelete}
                    title="Удалить"
                >
                    <DeleteIcon />
                </IconButton>
                <IconButton 
                    onClick={handlePrintQR}
                    title="Печать QR кода"
                >
                    <QRIcon />
                </IconButton>
            </ActionButtons>
            <Text>{displayNumber}</Text>
            <NameContainer>
                <Text>{equipment.name}</Text>
                {hasSNMP && (
                    <SNMPStatusDot 
                        status={snmpStatus}
                        title={`${getSNMPStatusText(snmpStatus)}${responseTime ? ` (${Math.round(responseTime)}ms)` : ''}`}
                    />
                )}
            </NameContainer>
            <Text>{equipment.releaseDate ? equipment.releaseDate : 'Нет данных'}</Text>
            <Text>{equipment.softwareStartDate || 'Нет данных'}</Text>
            <Text>{equipment.softwareEndDate || 'Нет данных'}</Text>
            <Text>{equipment.manufacturer}</Text>
            <Text>{equipment.place_id}</Text>
        </EquipmentContainer>
    );
};

// SVG иконки

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3,6 5,6 21,6"/>
        <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
);

const QRIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5"/>
        <rect x="16" y="3" width="5" height="5"/>
        <rect x="3" y="16" width="5" height="5"/>
        <line x1="5.5" y1="8.5" x2="5.5" y2="15.5"/>
        <line x1="18.5" y1="8.5" x2="18.5" y2="15.5"/>
        <line x1="8.5" y1="5.5" x2="15.5" y2="5.5"/>
        <line x1="8.5" y1="18.5" x2="15.5" y2="18.5"/>
        <rect x="16" y="16" width="3" height="3"/>
        <line x1="12" y1="12" x2="12" y2="12.01"/>
    </svg>
);

const EquipmentContainer = styled('div', {
    display: 'grid',
    gridTemplateColumns: '80px 60px 200px 120px 120px 120px 150px 100px',
    padding: '20px 16px',
    borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
    alignItems: 'center',
    minHeight: '60px',
    gap: '16px',
    variants: {
        type: {
            warning: {
                backgroundColor: 'rgba(251, 191, 36, 0.14)',
            },
            alert: {
                backgroundColor: 'rgba(220, 38, 38, 0.14)',
            },
        },
    },
});

const NameContainer = styled('div', {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
});

const SNMPStatusDot = styled('div', {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    cursor: 'help',
    transition: 'transform 0.2s ease',
    '&:hover': {
        transform: 'scale(1.2)',
    },
    variants: {
        status: {
            up: {
                backgroundColor: '#10b981',
                boxShadow: '0 0 4px rgba(16, 185, 129, 0.4)',
            },
            down: {
                backgroundColor: '#ef4444',
                boxShadow: '0 0 4px rgba(239, 68, 68, 0.4)',
            },
            error: {
                backgroundColor: '#ef4444',
                boxShadow: '0 0 4px rgba(239, 68, 68, 0.4)',
            },
            disabled: {
                backgroundColor: '#6b7280',
            },
            unknown: {
                backgroundColor: '#f59e0b',
            },
        },
    },
    defaultVariants: {
        status: 'unknown',
    },
});


const ActionButtons = styled('div', {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'flex-start',
});

const IconButton = styled('button', {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280', // серый цвет
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: '#374151', // темнее при наведении
        transform: 'scale(1.1)',
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
    '& svg': {
        width: '16px',
        height: '16px',
    },
});
