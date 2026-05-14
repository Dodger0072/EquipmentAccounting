import { Equipment } from '@/entities';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Header } from '..';
import { $items, fetchEquipmentFx, deleteEquipment, updateEquipmentFx, addEquipment } from '../../model';
import { Filter } from './filter';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Types, getType } from '@/shared/lib/get-type';
import { apiClient, $role } from '@/shared/auth';
import { Equipment as EquipmentType, EquipmentFormData } from '@/shared/types';
import { AddEquipmentPopup } from './euipment-popup';
import { EditEquipmentPopup } from './edit-equipment-popup';
import { QRPrintPopup } from './qr-print-popup';
import { checkAllSNMPDevices } from '@/app/api';
import { ColumnKey, loadVisibleColumns, saveVisibleColumns } from '@/shared/config';
import { NetworkDiscoveryPopup } from './network-discovery-popup';

export const EquipmentList: React.FC = () => {
    const equipmentList = useUnit($items);
    const role = useUnit($role);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
    const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
    const [snmpStatuses, setSnmpStatuses] = useState<Record<number, EquipmentType['snmp_status']>>({});
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(loadVisibleColumns);
    const [isQRPrintOpen, setIsQRPrintOpen] = useState(false);
    const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

    const handleColumnsChange = useCallback((cols: ColumnKey[]) => {
        setVisibleColumns(cols);
        saveVisibleColumns(cols);
    }, []);

    const effectiveColumns = role === 'student' ? visibleColumns.filter(c => c !== 'actions') : visibleColumns;

    useEffect(() => {
        console.log('EquipmentList: equipmentList updated:', equipmentList);
    }, [equipmentList]);

    useEffect(() => {
        fetchEquipmentFx();
    }, []);

    const checkSNMPStatuses = useCallback(async () => {
        try {
            const devicesWithSNMP = equipmentList.filter(
                (eq) => eq.snmp_config?.enabled
            );

            setSnmpStatuses((prev) => {
                const updated: Record<number, EquipmentType['snmp_status']> = {};
                Object.entries(prev).forEach(([deviceId, status]) => {
                    const device = equipmentList.find(eq => eq.id === Number(deviceId));
                    if (device?.snmp_config?.enabled) {
                        updated[Number(deviceId)] = status;
                    }
                });
                return updated;
            });

            if (devicesWithSNMP.length === 0) {
                return;
            }

            const results = await checkAllSNMPDevices();
            
            const newStatuses: Record<number, EquipmentType['snmp_status']> = {};
            Object.entries(results.results).forEach(([deviceId, status]) => {
                const deviceIdNum = Number(deviceId);
                const device = equipmentList.find(eq => eq.id === deviceIdNum);
                if (device?.snmp_config?.enabled) {
                    newStatuses[deviceIdNum] = status;
                }
            });
            
            setSnmpStatuses((prev) => ({ ...prev, ...newStatuses }));
        } catch (error) {
            console.error('Ошибка при проверке SNMP статусов:', error);
        }
    }, [equipmentList]);

    useEffect(() => {
        checkSNMPStatuses();

        intervalRef.current = setInterval(() => {
            checkSNMPStatuses();
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [checkSNMPStatuses]);

    const filteredEquipment = equipmentList.filter((equipment) => {
        const matchesSearch = equipment.name
            ? equipment.name.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        let matchesStatusCategory = true;
        if (selectedCategoryId === 2) {
            matchesStatusCategory = getType(equipment.softwareEndDate) === Types.warning;
        } else if (selectedCategoryId === 3) {
            matchesStatusCategory = getType(equipment.softwareEndDate) === Types.alert;
        }

        const matchesEquipmentCategory = selectedEquipmentCategory && selectedEquipmentCategory !== ''
            ? equipment.category === selectedEquipmentCategory
            : true;

            const matchesFloor = selectedFloor 
                ? equipment.mapId === parseInt(selectedFloor)
                : true;

            const matchesClassroom = selectedClassroom 
                ? equipment.place_id === selectedClassroom
                : true;

        return matchesSearch && matchesStatusCategory && matchesEquipmentCategory && matchesFloor && matchesClassroom;
    });

    const handleDeleteEquipment = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить это оборудование?')) return;

        try {
            await apiClient.delete(`/delete_device/${id}`);
            deleteEquipment(id);
            alert('Оборудование удалено');
        } catch (error) {
            console.error('Ошибка при удалении оборудования:', error);
            alert('Не удалось удалить оборудование');
        }
    };

    const handleAddEquipment = useCallback(async (data: any) => {
        const parseNumber = (value: any) => {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            const num = Number(value);
            return isNaN(num) ? null : num;
        };

        const numericData = {
            name: data.name,
            category: data.category,
            releaseDate: data.releaseDate,
            softwareStartDate: data.softwareStartDate,
            softwareEndDate: data.softwareEndDate || undefined,
            updateDate: data.updateDate || undefined,
            manufacturer: data.manufacturer,
            xCord: parseNumber(data.xCord),
            yCord: parseNumber(data.yCord),
            place_id: data.place_id,
            version: data.version || "1.0",
            mapId: data.mapId ? parseNumber(data.mapId) : undefined
        };


        if (!numericData.place_id || numericData.place_id.trim() === '') {
            alert(`Поле "Место" обязательно для заполнения. Получено: "${data.place_id}"`);
            return false;
        }
        if (numericData.xCord === null || numericData.xCord === undefined) {
            alert(`Поле "X Координата" обязательно для заполнения. Получено: ${data.xCord}`);
            return false;
        }
        if (numericData.yCord === null || numericData.yCord === undefined) {
            alert(`Поле "Y Координата" обязательно для заполнения. Получено: ${data.yCord}`);
            return false;
        }

        try {
            console.log("EquipmentList: handleAddEquipment - Sending POST request with data:", numericData);
            const response = await apiClient.post<{ id: number, device: any }>('/add_device', numericData);
            console.log("EquipmentList: handleAddEquipment - POST request successful.");
            
            const newEquipment = response.data.device;
            addEquipment(newEquipment);
            
            alert('Оборудование добавлено успешно!');
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Ошибка при добавлении оборудования:', error.response?.data);
                console.error('Отправленные данные:', numericData);
                alert(`Произошла ошибка при добавлении оборудования: ${JSON.stringify(error.response?.data)}`);
            } else {
                console.error("Неизвестная ошибка при добавлении:", error);
                alert("Неизвестная ошибка при добавлении оборудования");
            }
            return false;
        }
    }, []);

    const handleSubmitFromPopup = useCallback(async (data: EquipmentFormData) => {
        const success = await handleAddEquipment(data);
        
        if (success) {
            setIsPopupOpen(false);
        }
    }, [handleAddEquipment]);

    const handleEditEquipment = useCallback((equipment: EquipmentType) => {
        setEditingEquipment(equipment);
        setIsEditPopupOpen(true);
    }, []);

    const handleUpdateEquipment = useCallback(async (data: EquipmentFormData) => {
        if (!editingEquipment) return false;

        const parseNumber = (value: any) => {
            if (value === null || value === undefined || value === '') {
                return null;
            }
            const num = Number(value);
            return isNaN(num) ? null : num;
        };

        const numericData = {
            name: data.name,
            category: data.category,
            releaseDate: data.releaseDate,
            softwareStartDate: data.softwareStartDate,
            softwareEndDate: data.softwareEndDate || undefined,
            updateDate: data.updateDate || undefined,
            manufacturer: data.manufacturer,
            xCord: parseNumber(data.xCord),
            yCord: parseNumber(data.yCord),
            place_id: data.place_id,
            version: data.version || "1.0",
            mapId: data.mapId ? parseNumber(data.mapId) : undefined
        };

        if (!numericData.place_id || numericData.place_id.trim() === '') {
            alert(`Поле "Место" обязательно для заполнения. Получено: "${data.place_id}"`);
            return false;
        }
        if (numericData.xCord === null || numericData.xCord === undefined) {
            alert(`Поле "X Координата" обязательно для заполнения. Получено: ${data.xCord}`);
            return false;
        }
        if (numericData.yCord === null || numericData.yCord === undefined) {
            alert(`Поле "Y Координата" обязательно для заполнения. Получено: ${data.yCord}`);
            return false;
        }

        try {
            console.log("EquipmentList: handleUpdateEquipment - Editing equipment ID:", editingEquipment.id);
            console.log("EquipmentList: handleUpdateEquipment - Sending PUT request with data:", numericData);
            const equipmentWithId = {
                ...numericData,
                id: editingEquipment.id
            } as EquipmentType;
            
            console.log("EquipmentList: handleUpdateEquipment - Final equipment data with ID:", equipmentWithId);
            await updateEquipmentFx(equipmentWithId);
            console.log("EquipmentList: handleUpdateEquipment - PUT request successful.");
            alert('Оборудование обновлено успешно!');
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Ошибка при обновлении оборудования:', error.response?.data);
                console.error('Отправленные данные:', numericData);
                alert(`Произошла ошибка при обновлении оборудования: ${JSON.stringify(error.response?.data)}`);
            } else {
                console.error("Неизвестная ошибка при обновлении:", error);
                alert("Неизвестная ошибка при обновлении оборудования");
            }
            return false;
        }
    }, [editingEquipment]);

    const handleSubmitFromEditPopup = useCallback(async (data: EquipmentFormData) => {
        const success = await handleUpdateEquipment(data);
        
        if (success) {
            setIsEditPopupOpen(false);
            setEditingEquipment(null);
        }
    }, [handleUpdateEquipment]);


    return (
        <StyledContainer>
            <Filter 
                onSearch={setSearchTerm} 
                onCategoryChange={setSelectedCategoryId}
                onEquipmentCategoryChange={setSelectedEquipmentCategory}
                onFloorChange={setSelectedFloor}
                onClassroomChange={setSelectedClassroom}
                onAddEquipment={() => setIsPopupOpen(true)}
                onQRPrint={() => setIsQRPrintOpen(true)}
                onDiscoverDevices={() => setIsDiscoveryOpen(true)}
                visibleColumns={visibleColumns}
                onColumnsChange={handleColumnsChange}
            />
            <TableScroll>
            <Header visibleColumns={effectiveColumns} />
            {filteredEquipment.map((equipment, index) => {
                let finalSnmpStatus = null;
                
                if (equipment.snmp_config?.enabled === true) {
                    const currentSnmpStatus = snmpStatuses[equipment.id];
                    
                    if (currentSnmpStatus) {
                        finalSnmpStatus = currentSnmpStatus;
                    } else if (equipment.snmp_config?.status && equipment.snmp_config.status !== 'disabled') {
                        finalSnmpStatus = {
                            status: equipment.snmp_config.status as 'up' | 'down' | 'unknown' | 'error',
                            message: `Last check: ${equipment.snmp_config.last_check || 'Never'}`,
                            response_time: equipment.snmp_config.response_time,
                            timestamp: equipment.snmp_config.last_check || undefined
                        };
                    } else {
                        finalSnmpStatus = null;
                    }
                } else {
                    finalSnmpStatus = null;
                }
                
                const equipmentWithSNMP: EquipmentType = {
                    ...equipment,
                    snmp_status: finalSnmpStatus,
                };
                
                return (
                    <Equipment
                        key={`eq-${equipment.id}`}
                        equipment={equipmentWithSNMP}
                        displayNumber={index + 1}
                        onDelete={() => handleDeleteEquipment(equipment.id)}
                        onEdit={() => handleEditEquipment(equipment)}
                        visibleColumns={effectiveColumns}
                    />
                );
            })}

            </TableScroll>

            {isPopupOpen && (
                <AddEquipmentPopup
                    onSubmit={handleSubmitFromPopup}
                    onClose={() => {
                        setIsPopupOpen(false);
                    }}
                />
            )}

            {isEditPopupOpen && editingEquipment && (
                <EditEquipmentPopup
                    equipment={editingEquipment}
                    onSubmit={handleSubmitFromEditPopup}
                    onClose={() => {
                        setIsEditPopupOpen(false);
                        setEditingEquipment(null);
                    }}
                />
            )}

            {isQRPrintOpen && (
                <QRPrintPopup
                    equipmentList={equipmentList}
                    onClose={() => setIsQRPrintOpen(false)}
                />
            )}

            {isDiscoveryOpen && (
                <NetworkDiscoveryPopup
                    onClose={() => setIsDiscoveryOpen(false)}
                    onImported={() => {
                        setIsDiscoveryOpen(false);
                        fetchEquipmentFx();
                        checkSNMPStatuses();
                    }}
                />
            )}
        </StyledContainer>
    );
};

const StyledContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
});

const TableScroll = styled('div', {
    overflowX: 'auto',
    minWidth: 0,
});
