import { Equipment } from '@/entities';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Header } from '..';
import { $items, fetchEquipmentFx, deleteEquipment, updateEquipmentFx, addEquipment } from '../../model';
import { Filter } from './filter';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Types, getType } from '@/shared/lib/get-type';
import axios from 'axios';
import { Equipment as EquipmentType, EquipmentFormData } from '@/shared/types';
import { AddEquipmentPopup } from './euipment-popup';
import { EditEquipmentPopup } from './edit-equipment-popup';
import { checkAllSNMPDevices, checkSNMPStatus } from '@/app/api';

export const EquipmentList: React.FC = () => {
    const equipmentList = useUnit($items);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
    const [snmpStatuses, setSnmpStatuses] = useState<Record<number, EquipmentType['snmp_status']>>({});
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Добавляем логирование для отладки
    useEffect(() => {
        console.log('EquipmentList: equipmentList updated:', equipmentList);
    }, [equipmentList]);

    useEffect(() => {
        fetchEquipmentFx();
    }, []);

    // Функция для проверки SNMP статусов всех устройств
    const checkSNMPStatuses = useCallback(async () => {
        try {
            // Получаем все устройства с включенным SNMP
            const devicesWithSNMP = equipmentList.filter(
                (eq) => eq.snmp_config?.enabled
            );

            if (devicesWithSNMP.length === 0) {
                return;
            }

            // Проверяем все устройства через API
            const results = await checkAllSNMPDevices();
            
            // Обновляем статусы
            const newStatuses: Record<number, EquipmentType['snmp_status']> = {};
            Object.entries(results.results).forEach(([deviceId, status]) => {
                newStatuses[Number(deviceId)] = status;
            });
            
            setSnmpStatuses((prev) => ({ ...prev, ...newStatuses }));
        } catch (error) {
            console.error('Ошибка при проверке SNMP статусов:', error);
        }
    }, [equipmentList]);

    // Автоматическая проверка SNMP каждые 30 секунд
    useEffect(() => {
        // Первая проверка сразу
        checkSNMPStatuses();

        // Устанавливаем интервал на 30 секунд
        intervalRef.current = setInterval(() => {
            checkSNMPStatuses();
        }, 30000); // 30 секунд

        // Очистка при размонтировании
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

        const matchesEquipmentCategory = selectedEquipmentCategory 
            ? equipment.category === selectedEquipmentCategory
            : true;

            const matchesFloor = selectedFloor 
                ? equipment.place_id === selectedFloor
                : true;

        return matchesSearch && matchesStatusCategory && matchesEquipmentCategory && matchesFloor;
    });

    const handleDeleteEquipment = async (id: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить это оборудование?')) return;

        try {
            await axios.delete(`http://localhost:8000/delete_device/${id}`);
            deleteEquipment(id);
            // Убираем fetchEquipmentFx() - состояние уже обновляется через deleteEquipment
            alert('Оборудование удалено');
        } catch (error) {
            console.error('Ошибка при удалении оборудования:', error);
            alert('Не удалось удалить оборудование');
        }
    };

    const handleAddEquipment = useCallback(async (data: any) => {
        // Проверяем и преобразуем числовые поля
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
            place_id: data.place_id, // Оставляем как строку
            version: data.version || "1.0",
            mapId: data.mapId ? parseNumber(data.mapId) : undefined
        };


        // Проверяем обязательные поля
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
            const response = await axios.post<{ id: number, device: any }>('http://localhost:8000/add_device', numericData);
            console.log("EquipmentList: handleAddEquipment - POST request successful.");
            
            // Добавляем новое оборудование в состояние напрямую
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

        // Проверяем и преобразуем числовые поля
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

        // Проверяем обязательные поля
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
            // Создаем объект с правильным ID
            const equipmentWithId = {
                ...numericData,
                id: editingEquipment.id
            } as EquipmentType;
            
            console.log("EquipmentList: handleUpdateEquipment - Final equipment data with ID:", equipmentWithId);
            await updateEquipmentFx(equipmentWithId);
            console.log("EquipmentList: handleUpdateEquipment - PUT request successful.");
            // Убираем fetchEquipmentFx() - состояние уже обновляется через updateEquipmentFx.doneData
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
                onAddEquipment={() => setIsPopupOpen(true)}
            />
            <Header />
            {filteredEquipment.map((equipment, index) => {
                // Объединяем данные устройства с актуальным SNMP статусом
                // Приоритет: актуальный статус из проверки > статус из базы (snmp_config.status)
                const currentSnmpStatus = snmpStatuses[equipment.id];
                
                // Создаем snmp_status из базы данных если нет актуального
                let snmpStatusFromDB = null;
                if (equipment.snmp_config?.status && !currentSnmpStatus) {
                    snmpStatusFromDB = {
                        status: equipment.snmp_config.status as 'up' | 'down' | 'unknown' | 'disabled' | 'error',
                        message: `Last check: ${equipment.snmp_config.last_check || 'Never'}`,
                        response_time: equipment.snmp_config.response_time,
                        timestamp: equipment.snmp_config.last_check || undefined
                    };
                }
                
                const equipmentWithSNMP: EquipmentType = {
                    ...equipment,
                    snmp_status: currentSnmpStatus || snmpStatusFromDB,
                };
                
                // Отладка для устройства 14
                if (equipment.id === 14) {
                    console.log('Equipment 14 SNMP:', {
                        snmp_config: equipment.snmp_config,
                        currentSnmpStatus,
                        snmpStatusFromDB,
                        final: equipmentWithSNMP.snmp_status
                    });
                }
                
                return (
                    <Equipment
                        key={`eq-${equipment.id}`}
                        equipment={equipmentWithSNMP}
                        displayNumber={index + 1}
                        onDelete={() => handleDeleteEquipment(equipment.id)}
                        onEdit={() => handleEditEquipment(equipment)}
                    />
                );
            })}

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
        </StyledContainer>
    );
};

const StyledContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
});
