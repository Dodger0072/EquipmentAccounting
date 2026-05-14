import React, { useState, useEffect, useCallback } from 'react';
import { styled, keyframes } from '@stitches/react';
import { Text } from '@consta/uikit/Text';
import { useUnit } from 'effector-react';
import { DiscoveredDevice } from '@/shared/types/equipment';
import { discoverDevices, importDiscoveredDevices, getCategories, Category, getLocalSubnet } from '@/app/api';
import { $categories, fetchCategories } from '@/pages/admin/categories/model';
import { InteractiveMap } from '@/widgets/map/ui/organisms';

interface NetworkDiscoveryPopupProps {
    onClose: () => void;
    onImported: () => void;
}

type ScanState = 'idle' | 'scanning' | 'done' | 'error';

function renderDiscoverySource(dev: DiscoveredDevice) {
    if (dev.has_snmp) {
        return <SourceBadge kind="snmp">SNMP</SourceBadge>;
    }
    const icmp = Boolean(dev.seen_icmp);
    const arp = Boolean(dev.seen_arp);
    if (icmp && arp) {
        return <SourceBadge kind="mixed">ICMP+ARP</SourceBadge>;
    }
    if (icmp) {
        return <SourceBadge kind="icmp">ICMP</SourceBadge>;
    }
    return <SourceBadge kind="arp">ARP</SourceBadge>;
}

export const NetworkDiscoveryPopup: React.FC<NetworkDiscoveryPopupProps> = ({ onClose, onImported }) => {
    const [subnet, setSubnet] = useState('');
    const [community, setCommunity] = useState('public');
    const [timeout, setTimeout_] = useState('2');
    const [pingTimeoutMs, setPingTimeoutMs] = useState('1200');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [scanState, setScanState] = useState<ScanState>('idle');
    const [discovered, setDiscovered] = useState<DiscoveredDevice[]>([]);
    const [scanInfo, setScanInfo] = useState({
        total_scanned: 0,
        total_found: 0,
        scan_time: 0,
        scanner_host_ip: '',
        snmp_library_available: true as boolean,
    });
    const [errorMessage, setErrorMessage] = useState('');

    const [selected, setSelected] = useState<Set<string>>(new Set());

    const categories = useUnit($categories);
    const [importCategory, setImportCategory] = useState<{ id: number; label: string } | null>(null);
    const [importPlace, setImportPlace] = useState('');
    const [showMapSelector, setShowMapSelector] = useState(false);
    const [mapLocation, setMapLocation] = useState<{ x: number; y: number; mapId: number } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleLocationSelect = useCallback((x: number, y: number, mapId: number, classroomName?: string) => {
        setMapLocation({ x, y, mapId });
        if (classroomName) {
            setImportPlace(classroomName);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        getLocalSubnet().then(({ subnet }) => setSubnet(subnet));
    }, []);

    const categoryOptions = categories.map(c => ({ id: c.id, label: c.name }));

    const handleScan = async () => {
        setScanState('scanning');
        setErrorMessage('');
        setDiscovered([]);
        setSelected(new Set());

        try {
            const communities = community.split(',').map(c => c.trim()).filter(Boolean);
            const result = await discoverDevices(
                subnet,
                communities,
                parseFloat(timeout) || 2,
                parseInt(pingTimeoutMs, 10) || 1200,
            );
            setDiscovered(result.discovered);
            setScanInfo({
                total_scanned: result.total_scanned,
                total_found: result.total_found,
                scan_time: result.scan_time,
                scanner_host_ip: result.scanner_host_ip ?? '',
                snmp_library_available: result.snmp_library_available !== false,
            });
            setScanState('done');
        } catch (err: any) {
            setErrorMessage(err.message || 'Неизвестная ошибка');
            setScanState('error');
        }
    };

    const toggleSelect = (ip: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(ip)) next.delete(ip);
            else next.add(ip);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === discovered.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(discovered.map(d => d.ip)));
        }
    };

    const handleImport = async () => {
        if (selected.size === 0) return;
        setIsImporting(true);
        try {
            const devicesToImport = discovered
                .filter(d => selected.has(d.ip))
                .map(d => ({
                    ip: d.ip,
                    name: d.name || d.ip,
                    manufacturer_guess: d.manufacturer_guess,
                    community: d.community,
                    snmp_version: d.snmp_version,
                }));

            await importDiscoveredDevices(
                devicesToImport,
                importCategory?.label || '',
                importPlace,
                mapLocation ?? undefined,
            );
            onImported();
        } catch (err: any) {
            alert(`Ошибка импорта: ${err.message}`);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Overlay onClick={onClose}>
            <PopupContainer onClick={(e) => e.stopPropagation()}>
                <PopupHeader>
                    <Text size="xl" weight="bold">Поиск устройств в сети</Text>
                    <CloseBtn onClick={onClose}>&times;</CloseBtn>
                </PopupHeader>

                <ScanForm>
                    <FormRow>
                        <FormField style={{ flex: 1 }}>
                            <Label>Подсеть</Label>
                            <InputField
                                value={subnet}
                                onChange={e => setSubnet(e.target.value)}
                                placeholder="192.168.0.0/24"
                            />
                        </FormField>
                        <ScanButton onClick={handleScan} disabled={scanState === 'scanning' || !subnet} style={{ alignSelf: 'flex-end' }}>
                            {scanState === 'scanning' ? (
                                <>
                                    <Spinner />
                                    Сканирование...
                                </>
                            ) : (
                                <>
                                    <ScanIcon />
                                    Сканировать
                                </>
                            )}
                        </ScanButton>
                    </FormRow>

                    <AdvancedToggle onClick={() => setShowAdvanced(!showAdvanced)}>
                        {showAdvanced ? '▾' : '▸'} Дополнительные настройки
                    </AdvancedToggle>

                    {showAdvanced && (
                        <FormRow>
                            <FormField style={{ flex: 1 }}>
                                <Label>SNMP Community</Label>
                                <InputField
                                    value={community}
                                    onChange={e => setCommunity(e.target.value)}
                                    placeholder="public"
                                />
                            </FormField>
                            <FormField style={{ flex: 0.5 }}>
                                <Label>Таймаут SNMP (сек)</Label>
                                <InputField
                                    type="number"
                                    min="0.5"
                                    max="10"
                                    step="0.5"
                                    value={timeout}
                                    onChange={e => setTimeout_(e.target.value)}
                                />
                            </FormField>
                            <FormField style={{ flex: 0.5 }}>
                                <Label>Ping (мс)</Label>
                                <InputField
                                    type="number"
                                    min="500"
                                    max="5000"
                                    step="100"
                                    value={pingTimeoutMs}
                                    onChange={e => setPingTimeoutMs(e.target.value)}
                                />
                            </FormField>
                        </FormRow>
                    )}
                </ScanForm>

                {scanState === 'scanning' && (
                    <ScanningOverlay>
                        <BigSpinner />
                        <ScanningText>Идёт сканирование подсети {subnet}...</ScanningText>
                        <ScanningHint>Проверка адресов и опрос SNMP. Подождите.</ScanningHint>
                        <ProgressBar><ProgressFill /></ProgressBar>
                    </ScanningOverlay>
                )}

                {scanState === 'error' && (
                    <ErrorBanner>{errorMessage}</ErrorBanner>
                )}

                {scanState === 'done' && (
                    <ScanSummary>
                        Просканировано: <b>{scanInfo.total_scanned}</b> адресов
                        &nbsp;&middot;&nbsp;
                        Найдено: <b>{scanInfo.total_found}</b> устройств
                        &nbsp;&middot;&nbsp;
                        Время: <b>{scanInfo.scan_time}</b> сек
                        {scanInfo.scanner_host_ip ? (
                            <>
                                &nbsp;&middot;&nbsp;
                                Сканер (Backend): <b>{scanInfo.scanner_host_ip}</b>
                            </>
                        ) : null}
                        {!scanInfo.snmp_library_available ? (
                            <ScanWarn>
                                На сервере не установлен pysnmp — опрос SNMP отключён. Установите:{' '}
                                <code>pip install pysnmp</code>
                            </ScanWarn>
                        ) : null}
                    </ScanSummary>
                )}

                {discovered.length > 0 && (
                    <>
                        <TableContainer>
                            <DeviceTable>
                                <thead>
                                    <tr>
                                        <Th style={{ width: 36 }}>
                                            <input
                                                type="checkbox"
                                                checked={selected.size === discovered.length}
                                                onChange={toggleAll}
                                            />
                                        </Th>
                                        <Th>IP</Th>
                                        <Th>MAC</Th>
                                        <Th>Имя</Th>
                                        <Th>Источник</Th>
                                        <Th>Тип</Th>
                                        <Th>Производитель</Th>
                                        <Th>Описание</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discovered.map(dev => (
                                        <Tr
                                            key={dev.ip}
                                            isSelected={selected.has(dev.ip)}
                                            onClick={() => toggleSelect(dev.ip)}
                                        >
                                            <Td>
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(dev.ip)}
                                                    onChange={() => toggleSelect(dev.ip)}
                                                />
                                            </Td>
                                            <Td><code>{dev.ip}</code></Td>
                                            <Td><MacCell>{dev.mac || '—'}</MacCell></Td>
                                            <Td>{dev.name || '—'}</Td>
                                            <Td>{renderDiscoverySource(dev)}</Td>
                                            <Td>
                                                {dev.device_type_guess ? (
                                                    <DeviceTypeBadge type={dev.device_type_guess}>
                                                        {dev.device_type_guess}
                                                    </DeviceTypeBadge>
                                                ) : '—'}
                                            </Td>
                                            <Td>{dev.manufacturer_guess || '—'}</Td>
                                            <Td title={dev.description}>
                                                <DescriptionCell>{dev.description || '—'}</DescriptionCell>
                                            </Td>
                                        </Tr>
                                    ))}
                                </tbody>
                            </DeviceTable>
                        </TableContainer>

                        <ImportSection>
                            <Text size="m" weight="semibold">Импорт выбранных устройств ({selected.size})</Text>
                            <ImportForm>
                                <FormField>
                                    <Label>Категория</Label>
                                    <NativeSelect
                                        value={importCategory?.id ?? ''}
                                        onChange={e => {
                                            const id = Number(e.target.value);
                                            const found = categoryOptions.find(c => c.id === id);
                                            setImportCategory(found ?? null);
                                        }}
                                    >
                                        <option value="" disabled>Выберите категорию</option>
                                        {categoryOptions.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </NativeSelect>
                                </FormField>
                                <FormField>
                                    <Label>Размещение на карте</Label>
                                    <LocationButton type="button" onClick={() => setShowMapSelector(prev => !prev)}>
                                        <MapPinIcon />
                                        {mapLocation
                                            ? `${importPlace || `Этаж ${mapLocation.mapId}`} (${mapLocation.x}, ${mapLocation.y})`
                                            : 'Выбрать место на карте'
                                        }
                                    </LocationButton>
                                </FormField>
                                <ImportButton
                                    onClick={handleImport}
                                    disabled={selected.size === 0 || isImporting}
                                >
                                    {isImporting ? 'Импорт...' : `Импортировать ${selected.size} устройств`}
                                </ImportButton>
                            </ImportForm>
                            {showMapSelector && (
                                <MapSelectorContainer>
                                    <InteractiveMap
                                        onLocationSelect={handleLocationSelect}
                                        selectedLocation={mapLocation}
                                        selectedMapId={mapLocation?.mapId}
                                    />
                                </MapSelectorContainer>
                            )}
                        </ImportSection>
                    </>
                )}

                {scanState === 'done' && discovered.length === 0 && (
                    <EmptyState>
                        Устройства не найдены в указанной подсети.
                        Убедитесь, что ваш компьютер подключён к этой сети.
                    </EmptyState>
                )}
            </PopupContainer>
        </Overlay>
    );
};

/* ---------- icons ---------- */

const MapPinIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ScanIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

const Spinner = () => (
    <SpinnerSvg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </SpinnerSvg>
);

const BigSpinner = () => (
    <BigSpinnerSvg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </BigSpinnerSvg>
);

/* ---------- styled ---------- */

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

const PopupContainer = styled('div', {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    width: '900px',
    maxWidth: '95vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    overflowX: 'hidden',
});

const PopupHeader = styled('div', {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
});

const CloseBtn = styled('button', {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '4px 8px',
    borderRadius: '4px',
    '&:hover': { backgroundColor: '#f3f4f6', color: '#111827' },
});

const ScanForm = styled('div', {
    padding: '20px 24px',
    borderBottom: '1px solid #f3f4f6',
});

const FormRow = styled('div', {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px',
});

const FormField = styled('div', {
    display: 'flex',
    flexDirection: 'column',
});

const Label = styled('label', {
    fontSize: '13px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '4px',
});

const InputField = styled('input', {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
    },
});

const AdvancedToggle = styled('button', {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px 0',
    marginTop: '4px',
    textAlign: 'left',
    '&:hover': { color: '#6b7280' },
});

const ScanButton = styled('button', {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    '&:hover': { backgroundColor: '#2563eb' },
    '&:disabled': { backgroundColor: '#93c5fd', cursor: 'not-allowed' },
});

const spin = keyframes({
    to: { transform: 'rotate(360deg)' },
});

const progressSlide = keyframes({
    '0%': { left: '-30%' },
    '100%': { left: '100%' },
});

const SpinnerSvg = styled('svg', {
    animation: `${spin} 0.8s linear infinite`,
});

const BigSpinnerSvg = styled('svg', {
    animation: `${spin} 1s linear infinite`,
});

const ScanningOverlay = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    gap: '12px',
});

const ScanningText = styled('div', {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1f2937',
});

const ScanningHint = styled('div', {
    fontSize: '13px',
    color: '#9ca3af',
});

const ProgressBar = styled('div', {
    width: '300px',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
    marginTop: '8px',
});

const ProgressFill = styled('div', {
    position: 'absolute',
    top: 0,
    left: '-30%',
    width: '30%',
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
    animation: `${progressSlide} 1.2s ease-in-out infinite`,
});

const ErrorBanner = styled('div', {
    margin: '0 24px',
    marginTop: '12px',
    padding: '10px 14px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    fontSize: '13px',
});

const ScanSummary = styled('div', {
    padding: '10px 24px',
    fontSize: '13px',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f3f4f6',
});

const ScanWarn = styled('div', {
    marginTop: '8px',
    padding: '8px 10px',
    fontSize: '12px',
    color: '#92400e',
    backgroundColor: '#fffbeb',
    borderRadius: '6px',
    border: '1px solid #fde68a',
    '& code': { fontSize: '11px' },
});

const TableContainer = styled('div', {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    padding: '0',
});

const DeviceTable = styled('table', {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
});

const Th = styled('th', {
    textAlign: 'left',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontWeight: 600,
    color: '#374151',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 1,
});

const Td = styled('td', {
    padding: '8px 12px',
    borderBottom: '1px solid #f3f4f6',
    color: '#374151',
    verticalAlign: 'middle',
});

const Tr = styled('tr', {
    cursor: 'pointer',
    transition: 'background-color 0.1s',
    '&:hover': { backgroundColor: '#f0f9ff' },
    variants: {
        isSelected: {
            true: { backgroundColor: '#eff6ff' },
        },
    },
});

const DescriptionCell = styled('div', {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

const MacCell = styled('code', {
    fontSize: '12px',
    color: '#6b7280',
    whiteSpace: 'nowrap',
});

const SourceBadge = styled('span', {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.3px',
    variants: {
        kind: {
            snmp: { backgroundColor: '#d1fae5', color: '#065f46' },
            icmp: { backgroundColor: '#dbeafe', color: '#1e40af' },
            arp: { backgroundColor: '#fef3c7', color: '#92400e' },
            mixed: { backgroundColor: '#e0e7ff', color: '#3730a3' },
        },
    },
});

const DeviceTypeBadge = styled('span', {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    variants: {
        type: {
            Router: { backgroundColor: '#dbeafe', color: '#1e40af' },
            Switch: { backgroundColor: '#d1fae5', color: '#065f46' },
            'Access Point': { backgroundColor: '#e0e7ff', color: '#3730a3' },
            Printer: { backgroundColor: '#fef3c7', color: '#92400e' },
            Firewall: { backgroundColor: '#fee2e2', color: '#991b1b' },
            UPS: { backgroundColor: '#f3e8ff', color: '#6b21a8' },
            NAS: { backgroundColor: '#ccfbf1', color: '#134e4a' },
            Server: { backgroundColor: '#e0e7ff', color: '#3730a3' },
            Computer: { backgroundColor: '#f3f4f6', color: '#374151' },
            Camera: { backgroundColor: '#fce7f3', color: '#9d174d' },
            Phone: { backgroundColor: '#e0f2fe', color: '#075985' },
            Unknown: { backgroundColor: '#f3f4f6', color: '#6b7280' },
        },
    },
    defaultVariants: { type: 'Unknown' },
});

const ImportSection = styled('div', {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
});

const ImportForm = styled('div', {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    marginTop: '10px',
    flexWrap: 'wrap',
});

const NativeSelect = styled('select', {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    backgroundColor: 'white',
    color: '#374151',
    minWidth: '200px',
    cursor: 'pointer',
    '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
    },
});

const ImportButton = styled('button', {
    padding: '8px 20px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    whiteSpace: 'nowrap',
    '&:hover': { backgroundColor: '#059669' },
    '&:disabled': { backgroundColor: '#6ee7b7', cursor: 'not-allowed' },
});

const LocationButton = styled('button', {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'left',
    color: '#374151',
    whiteSpace: 'nowrap',
    '&:hover': { backgroundColor: '#e5e7eb', borderColor: '#9ca3af' },
    '&:focus': { borderColor: '#3b82f6', outline: 'none', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' },
});

const MapSelectorContainer = styled('div', {
    marginTop: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#ffffff',
});

const EmptyState = styled('div', {
    padding: '40px 24px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
});
