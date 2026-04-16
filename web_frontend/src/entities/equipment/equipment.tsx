import { Equipment as EquipmentType } from '@/shared/types';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';
import { getType } from '@/shared/lib/get-type';
import { ColumnKey, getGridTemplate } from '@/shared/config';

type EquipmentProps = {
    equipment: EquipmentType;
    displayNumber: number;
    onDelete: () => void;
    onEdit: () => void;
    visibleColumns: ColumnKey[];
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

export const Equipment = ({ equipment, displayNumber, onDelete, onEdit, visibleColumns }: EquipmentProps) => {
    const type = getType(equipment.softwareEndDate || '');
    const hasSNMP = equipment.snmp_config?.enabled === true;
    let snmpStatus: 'up' | 'down' | 'unknown' | 'disabled' | 'error' | undefined = undefined;
    let responseTime: number | undefined = undefined;
    
    if (hasSNMP) {
        if (equipment.snmp_status?.status && equipment.snmp_status.status !== 'disabled') {
            snmpStatus = equipment.snmp_status.status;
            responseTime = equipment.snmp_status.response_time ?? undefined;
        } 
        else if (equipment.snmp_config?.status && 
                 equipment.snmp_config.status !== 'disabled' && 
                 equipment.snmp_config.status !== null && 
                 equipment.snmp_config.status !== undefined) {
            snmpStatus = equipment.snmp_config.status;
            responseTime = equipment.snmp_config.response_time ?? undefined;
        }
    }
    
    const gridTemplate = getGridTemplate(visibleColumns);

    const columnRenderers: Record<ColumnKey, () => React.ReactNode> = {
        actions: () => (
            <ActionButtons key="actions">
                <IconButton onClick={onEdit} title="Редактировать">
                    <EditIcon />
                </IconButton>
                <IconButton onClick={onDelete} title="Удалить">
                    <DeleteIcon />
                </IconButton>
            </ActionButtons>
        ),
        number: () => <Text key="number">{displayNumber}</Text>,
        name: () => (
            <NameContainer key="name">
                <Text>{equipment.name}</Text>
                {hasSNMP && snmpStatus && (
                    <SNMPStatusDot 
                        status={snmpStatus}
                        title={`${getSNMPStatusText(snmpStatus)}${responseTime ? ` (${Math.round(responseTime)}ms)` : ''}`}
                    />
                )}
            </NameContainer>
        ),
        category: () => <Text key="category">{equipment.category || 'Нет данных'}</Text>,
        releaseDate: () => <Text key="releaseDate">{equipment.releaseDate ? equipment.releaseDate : 'Нет данных'}</Text>,
        softwareStartDate: () => <Text key="softwareStartDate">{equipment.softwareStartDate || 'Нет данных'}</Text>,
        softwareEndDate: () => <Text key="softwareEndDate">{equipment.softwareEndDate || 'Нет данных'}</Text>,
        updateDate: () => <Text key="updateDate">{equipment.updateDate || 'Нет данных'}</Text>,
        manufacturer: () => <Text key="manufacturer">{equipment.manufacturer}</Text>,
        place_id: () => <Text key="place_id">{equipment.place_id}</Text>,
        version: () => <Text key="version">{equipment.version || 'Нет данных'}</Text>,
    };

    return (
        <EquipmentContainer type={type} style={{ gridTemplateColumns: gridTemplate }}>
            {visibleColumns.map((key) => columnRenderers[key]())}
        </EquipmentContainer>
    );
};

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

const EquipmentContainer = styled('div', {
    display: 'grid',
    padding: '12px 12px',
    borderBottom: '1px solid rgba(107, 114, 128, 0.19)',
    alignItems: 'center',
    minHeight: '48px',
    gap: '14px',
    fontSize: '14px',
    minWidth: 'fit-content',
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
    color: '#6b7280',
    transition: 'all 0.2s ease',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        color: '#374151',
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
