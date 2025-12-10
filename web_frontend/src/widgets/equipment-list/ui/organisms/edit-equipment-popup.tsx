import React, { useEffect, useState, useCallback } from 'react';
import { styled } from '@stitches/react';
import { Select } from '@consta/uikit/Select';
import { Text } from '@consta/uikit/Text';
import { useUnit } from 'effector-react';
import { EquipmentFormData, Equipment, SNMPConfig } from '../../../../shared/types';
import { $categories, fetchCategories } from '@/pages/admin/categories/model';
import { $manufacturers, fetchManufacturers } from '@/pages/admin/manufacturers/model';
import { InteractiveMap } from '@/widgets/map/ui/organisms';
import { addSNMPConfig } from '@/app/api';

interface EditEquipmentPopupProps {
    equipment: Equipment;
    onClose: () => void;
    onSubmit: (data: EquipmentFormData) => void;
}

export const EditEquipmentPopup: React.FC<EditEquipmentPopupProps> = ({ 
    equipment,
    onClose, 
    onSubmit
}) => {
    const [formData, setFormData] = useState<EquipmentFormData>({
        name: equipment.name,
        category: equipment.category,
        releaseDate: equipment.releaseDate,
        softwareStartDate: equipment.softwareStartDate,
        softwareEndDate: equipment.softwareEndDate || '',
        updateDate: equipment.updateDate || '',
        manufacturer: equipment.manufacturer,
        xCord: equipment.xCord,
        yCord: equipment.yCord,
        mapId: equipment.mapId || undefined,
        place_id: equipment.place_id,
        version: equipment.version,
        id: equipment.id,
    });
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
    const [showMapSelector, setShowMapSelector] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showSNMPSection, setShowSNMPSection] = useState<boolean>(false);
    
    // SNMP конфигурация
    const [snmpConfig, setSnmpConfig] = useState<Partial<SNMPConfig>>({
        enabled: equipment.snmp_config?.enabled || false,
        ip_address: equipment.snmp_config?.ip_address || '',
        port: equipment.snmp_config?.port || 161,
        community: equipment.snmp_config?.community || 'public',
        version: equipment.snmp_config?.version || '2c',
    });
    
    // Показываем SNMP секцию если уже есть конфигурация
    useEffect(() => {
        if (equipment.snmp_config?.enabled) {
            setShowSNMPSection(true);
        }
    }, [equipment.snmp_config]);
    
    const categories = useUnit($categories);
    const manufacturers = useUnit($manufacturers);

    // Загружаем данные при монтировании
    useEffect(() => {
        fetchCategories();
        fetchManufacturers();
    }, []);

    // Устанавливаем выбранные категорию и производителя при загрузке
    useEffect(() => {
        if (categories.length > 0) {
            const category = categories.find(cat => cat.name === equipment.category);
            if (category) {
                setSelectedCategory(category);
            }
        }
    }, [categories, equipment.category]);

    useEffect(() => {
        if (manufacturers.length > 0 && selectedCategory) {
            const manufacturer = manufacturers.find(man => 
                man.name === equipment.manufacturer && man.category_id === selectedCategory.id
            );
            if (manufacturer) {
                setSelectedManufacturer(manufacturer);
            }
        }
    }, [manufacturers, selectedCategory, equipment.manufacturer]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value
        }));
    }, []);

    const handleCategoryChange = useCallback((value: any) => {
        setSelectedCategory(value);
        setFormData(prev => ({
            ...prev,
            category: value?.name || ''
        }));
        
        // Сбрасываем производителя при смене категории
        setSelectedManufacturer(null);
        setFormData(prev => ({
            ...prev,
            manufacturer: ''
        }));
    }, []);

    const handleManufacturerChange = useCallback((value: any) => {
        setSelectedManufacturer(value);
        setFormData(prev => ({
            ...prev,
            manufacturer: value?.name || ''
        }));
    }, []);

    const handleLocationSelect = useCallback((x: number, y: number, mapId: number) => {
        setFormData(prev => ({
            ...prev,
            xCord: x,
            yCord: y,
            mapId: mapId
        }));
    }, []);

    const toggleMapSelector = useCallback(() => {
        setShowMapSelector(prev => !prev);
    }, []);

    const handleSNMPChange = useCallback((field: keyof SNMPConfig, value: any) => {
        setSnmpConfig(prev => ({
            ...prev,
            [field]: field === 'enabled' ? value : (field === 'port' ? Number(value) : value)
        }));
    }, []);

    const handleSaveSNMP = useCallback(async () => {
        if (!snmpConfig.ip_address) {
            alert('Пожалуйста, укажите IP адрес для SNMP');
            return;
        }

        try {
            await addSNMPConfig({
                device_id: equipment.id!,
                enabled: snmpConfig.enabled || false,
                ip_address: snmpConfig.ip_address!,
                port: snmpConfig.port || 161,
                community: snmpConfig.community || 'public',
                version: snmpConfig.version || '2c',
            });
            
            // Сразу проверяем SNMP после сохранения и ждем результат
            try {
                const { checkSNMPStatus } = await import('@/app/api');
                const statusResult = await checkSNMPStatus(equipment.id!);
                const statusText = statusResult.status === 'up' ? 'Работает' : 
                                 statusResult.status === 'down' ? 'Не отвечает' : 
                                 statusResult.status === 'error' ? 'Ошибка' : 'Неизвестно';
                alert(`SNMP конфигурация сохранена!\nСтатус проверки: ${statusText}${statusResult.response_time ? ` (${Math.round(statusResult.response_time)}ms)` : ''}`);
            } catch (checkError: any) {
                console.warn('Не удалось проверить SNMP сразу:', checkError);
                alert(`SNMP конфигурация сохранена, но проверка не удалась: ${checkError.message || 'Неизвестная ошибка'}`);
            }
            
            // Обновляем страницу для загрузки новой конфигурации
            window.location.reload();
        } catch (error: any) {
            console.error('Ошибка при сохранении SNMP:', error);
            alert(`Ошибка: ${error.message || 'Не удалось сохранить SNMP конфигурацию'}`);
        }
    }, [snmpConfig, equipment.id]);

    const handleTestSNMP = useCallback(async () => {
        if (!snmpConfig.ip_address) {
            alert('Пожалуйста, укажите IP адрес для SNMP');
            return;
        }

        try {
            const { checkSNMPStatus } = await import('@/app/api');
            const statusResult = await checkSNMPStatus(equipment.id!);
            const statusText = statusResult.status === 'up' ? 'Работает ✓' : 
                             statusResult.status === 'down' ? 'Не отвечает ✗' : 
                             statusResult.status === 'error' ? 'Ошибка ✗' : 'Неизвестно';
            alert(`Результат проверки SNMP:\n${statusText}\n${statusResult.message}${statusResult.response_time ? `\nВремя отклика: ${Math.round(statusResult.response_time)}ms` : ''}`);
        } catch (error: any) {
            console.error('Ошибка при проверке SNMP:', error);
            alert(`Ошибка проверки: ${error.message || 'Не удалось проверить SNMP'}`);
        }
    }, [snmpConfig, equipment.id]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isSubmitting) {
            return;
        }
        
        // Валидация
        if (!formData.mapId || !formData.xCord || !formData.yCord) {
            alert('Пожалуйста, выберите место размещения на карте');
            return;
        }
        
        if (!formData.name || !formData.category || !formData.manufacturer) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, isSubmitting, onSubmit]);

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const isLoading = isSubmitting;

    return (
        <PopupOverlay>
            <PopupContainer>
                <h2>Редактировать оборудование</h2>
                <form onSubmit={handleSubmit}>
                    <FormField>
                        <Label>Название *</Label>
                        <InputField 
                            name="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            placeholder="Введите название оборудования" 
                            required 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Категория *</Label>
                        <SelectField>
                            <Select
                                items={categories}
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                getItemLabel={(item: any) => item.name}
                                getItemKey={(item: any) => item.id.toString()}
                                placeholder="Выберите категорию"
                                required
                            />
                        </SelectField>
                    </FormField>
                    
                    <FormField>
                        <Label>Дата закупки *</Label>
                        <InputField 
                            name="releaseDate" 
                            value={formData.releaseDate} 
                            type="date" 
                            onChange={handleInputChange} 
                            required 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Дата устаревания *</Label>
                        <InputField 
                            name="softwareStartDate" 
                            type="date" 
                            value={formData.softwareStartDate} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Дата снятия</Label>
                        <InputField 
                            name="softwareEndDate" 
                            type="date" 
                            value={formData.softwareEndDate || ''} 
                            onChange={handleInputChange} 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Дата обновления ПО</Label>
                        <InputField 
                            name="updateDate" 
                            type="date" 
                            value={formData.updateDate || ''} 
                            onChange={handleInputChange} 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Производитель *</Label>
                        <SelectField>
                            <Select
                                items={selectedCategory ? manufacturers.filter(man => man.category_id === selectedCategory.id) : manufacturers}
                                value={selectedManufacturer}
                                onChange={handleManufacturerChange}
                                getItemLabel={(item: any) => item.name}
                                getItemKey={(item: any) => item.id.toString()}
                                placeholder="Выберите производителя"
                                required
                            />
                        </SelectField>
                    </FormField>
                    
                    <FormField>
                        <Label>Версия *</Label>
                        <InputField 
                            name="version" 
                            placeholder="Введите версию" 
                            value={formData.version} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Место *</Label>
                        <InputField 
                            name="place_id" 
                            placeholder="Например: Admin Room" 
                            value={formData.place_id} 
                            onChange={handleInputChange} 
                            required 
                        />
                    </FormField>
                    
                    <FormField>
                        <Label>Размещение на карте *</Label>
                        <LocationContainer>
                            <LocationButton type="button" onClick={toggleMapSelector}>
                                {formData.mapId && formData.xCord && formData.yCord 
                                    ? `Выбрано: Этаж ${formData.mapId}, координаты (${formData.xCord}, ${formData.yCord})`
                                    : 'Выбрать место на карте'
                                }
                            </LocationButton>
                            {showMapSelector && (
                                <MapSelectorContainer>
                                    <InteractiveMap
                                        onLocationSelect={handleLocationSelect}
                                        selectedLocation={
                                            formData.mapId && formData.xCord && formData.yCord
                                                ? { x: formData.xCord, y: formData.yCord, mapId: formData.mapId }
                                                : null
                                        }
                                        selectedMapId={formData.mapId || undefined}
                                    />
                                </MapSelectorContainer>
                            )}
                        </LocationContainer>
                    </FormField>
                    
                    {/* SNMP секция */}
                    <SNMPSection>
                        <SNMPHeader>
                            <Label>SNMP Мониторинг</Label>
                            <ToggleButton 
                                type="button" 
                                onClick={() => setShowSNMPSection(!showSNMPSection)}
                            >
                                {showSNMPSection ? '▼' : '▶'}
                            </ToggleButton>
                        </SNMPHeader>
                        
                        {showSNMPSection && (
                            <SNMPFields>
                                <FormField>
                                    <CheckboxContainer>
                                        <input
                                            type="checkbox"
                                            checked={snmpConfig.enabled || false}
                                            onChange={(e) => handleSNMPChange('enabled', e.target.checked)}
                                        />
                                        <Label style={{ margin: 0, marginLeft: '8px' }}>
                                            Включить SNMP мониторинг
                                        </Label>
                                    </CheckboxContainer>
                                </FormField>
                                
                                {snmpConfig.enabled && (
                                    <>
                                        <FormField>
                                            <Label>IP адрес *</Label>
                                            <InputField
                                                type="text"
                                                value={snmpConfig.ip_address || ''}
                                                onChange={(e) => handleSNMPChange('ip_address', e.target.value)}
                                                placeholder="192.168.1.1"
                                                required
                                            />
                                        </FormField>
                                        
                                        <FormField>
                                            <Label>Порт</Label>
                                            <InputField
                                                type="number"
                                                value={snmpConfig.port || 161}
                                                onChange={(e) => handleSNMPChange('port', e.target.value)}
                                                placeholder="161"
                                                min="1"
                                                max="65535"
                                            />
                                        </FormField>
                                        
                                        <FormField>
                                            <Label>Community</Label>
                                            <InputField
                                                type="text"
                                                value={snmpConfig.community || 'public'}
                                                onChange={(e) => handleSNMPChange('community', e.target.value)}
                                                placeholder="public"
                                            />
                                        </FormField>
                                        
                                        <FormField>
                                            <Label>Версия SNMP</Label>
                                            <SelectField>
                                                <Select
                                                    items={[
                                                        { id: '1', name: 'SNMPv1' },
                                                        { id: '2c', name: 'SNMPv2c' },
                                                        { id: '3', name: 'SNMPv3' },
                                                    ]}
                                                    value={snmpConfig.version ? { id: snmpConfig.version, name: `SNMPv${snmpConfig.version}` } : null}
                                                    onChange={(value: any) => handleSNMPChange('version', value?.id || '2c')}
                                                    getItemLabel={(item: any) => item.name}
                                                    getItemKey={(item: any) => item.id}
                                                    placeholder="Выберите версию"
                                                />
                                            </SelectField>
                                        </FormField>
                                        
                                        <ButtonContainer>
                                            <Button 
                                                type="button" 
                                                onClick={handleSaveSNMP}
                                                style={{ backgroundColor: '#10b981', marginRight: '8px' }}
                                            >
                                                Сохранить SNMP конфигурацию
                                            </Button>
                                            <Button 
                                                type="button" 
                                                onClick={handleTestSNMP}
                                                style={{ backgroundColor: '#3b82f6' }}
                                            >
                                                Проверить SNMP
                                            </Button>
                                        </ButtonContainer>
                                        
                                        {equipment.snmp_config && (
                                            <SNMPInfo>
                                                <Text size="xs" style={{ color: '#6b7280' }}>
                                                    Текущий статус: {equipment.snmp_config.status || 'unknown'}
                                                    {equipment.snmp_config.response_time && ` (${Math.round(equipment.snmp_config.response_time)}ms)`}
                                                    {equipment.snmp_config.last_check && ` • Проверено: ${new Date(equipment.snmp_config.last_check).toLocaleString('ru-RU')}`}
                                                </Text>
                                            </SNMPInfo>
                                        )}
                                    </>
                                )}
                            </SNMPFields>
                        )}
                    </SNMPSection>
                    
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                </form>
                <CloseButton onClick={handleClose}>Закрыть</CloseButton>
            </PopupContainer>
        </PopupOverlay>
    );
};

const PopupOverlay = styled('div', {
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
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    width: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    className: 'modal-with-select',
});

const FormField = styled('div', {
    marginBottom: '16px',
});

const Label = styled('label', {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
});

const InputField = styled('input', {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
});

const SelectField = styled('div', {
    width: '100%',
    position: 'relative',
    zIndex: 1001,
    
    // Стили для выпадающих списков Consta UI
    '& [data-popper-placement]': {
        zIndex: '1001 !important',
    },
    
    // Альтернативный селектор для выпадающих списков
    '& .Select-Dropdown': {
        zIndex: '1001 !important',
    },
    
    // Общий селектор для всех выпадающих элементов
    '& [role="listbox"], & [role="option"]': {
        zIndex: '1001 !important',
    },
});

const Button = styled('button', {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '10px',
    '&:hover': {
        backgroundColor: '#2563eb',
    },
    '&:disabled': {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
        '&:hover': {
            backgroundColor: '#9ca3af',
        },
    },
});

const CloseButton = styled(Button, {
    backgroundColor: '#6b7280',
    '&:hover': {
        backgroundColor: '#4b5563',
    },
});

const LocationContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
});

const LocationButton = styled('button', {
    padding: '12px 16px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
    color: '#374151',
    
    '&:hover': {
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
    },
    
    '&:focus': {
        borderColor: '#3b82f6',
        outline: 'none',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
});

const MapSelectorContainer = styled('div', {
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '16px',
    backgroundColor: '#ffffff',
});

const SNMPSection = styled('div', {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e7eb',
});

const SNMPHeader = styled('div', {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    cursor: 'pointer',
    '&:hover': {
        opacity: 0.8,
    },
});

const ToggleButton = styled('button', {
    background: 'none',
    border: 'none',
    fontSize: '12px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px 8px',
    '&:hover': {
        color: '#374151',
    },
});

const SNMPFields = styled('div', {
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
});

const CheckboxContainer = styled('div', {
    display: 'flex',
    alignItems: 'center',
    '& input[type="checkbox"]': {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
});

const SNMPInfo = styled('div', {
    marginTop: '12px',
    padding: '8px',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    border: '1px solid #e5e7eb',
});

const ButtonContainer = styled('div', {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
});
