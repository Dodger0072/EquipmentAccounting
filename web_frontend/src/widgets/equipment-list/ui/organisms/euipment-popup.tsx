import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { styled } from '@stitches/react';
import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { Equipment, EquipmentFormData } from '../../../../shared/types';
import { $categories, fetchCategories } from '@/pages/admin/categories/model';
import { $manufacturers, fetchManufacturers } from '@/pages/admin/manufacturers/model';
import { InteractiveMap } from '@/widgets/map/ui/organisms';
import { updateEquipmentFx } from '@/features/equipment/model/updateEquipmentFx';

interface AddEquipmentPopupProps {
    onClose: () => void;
    onSubmit: (data: EquipmentFormData) => void;
    initialData?: Equipment;
}

const defaultFormData: EquipmentFormData = {
    name: '',
    category: '',
    releaseDate: '',
    softwareStartDate: '',
    softwareEndDate: '',
    updateDate: '',
    manufacturer: '',
    xCord: 0,
    yCord: 0,
    mapId: undefined,
    place_id: '',
    version: '1.0',
};

export const AddEquipmentPopup: React.FC<AddEquipmentPopupProps> = ({ 
    onClose, 
    onSubmit, 
    initialData 
}) => {
    const [formData, setFormData] = useState<EquipmentFormData>(defaultFormData);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
    const [showMapSelector, setShowMapSelector] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    
    const categories = useUnit($categories);
    const manufacturers = useUnit($manufacturers);
    const isUpdating = useUnit(updateEquipmentFx.pending);

    // Стабилизируем initialData, чтобы избежать переинициализации
    const stableInitialData = useMemo(() => {
        if (!initialData) return null;
        return {
            ...initialData,
            softwareEndDate: initialData.softwareEndDate || '',
            updateDate: initialData.updateDate || '',
            mapId: initialData.mapId || undefined,
        };
    }, [initialData?.id, initialData?.name, initialData?.category, initialData?.manufacturer]);

    // Загружаем данные при монтировании
    useEffect(() => {
        fetchCategories();
        fetchManufacturers();
    }, []);

    // Инициализируем форму данными только один раз
    useEffect(() => {
        if (!isInitialized && stableInitialData) {
            console.log('AddEquipmentPopup: Initializing form with data:', stableInitialData);
            setFormData(stableInitialData);
            setIsInitialized(true);
        } else if (!isInitialized && !stableInitialData) {
            console.log('AddEquipmentPopup: Initializing form with default data');
            setFormData(defaultFormData);
            setSelectedCategory(null);
            setSelectedManufacturer(null);
            setIsInitialized(true);
        }
    }, [stableInitialData, isInitialized]);

    // Синхронизируем выбранные категорию и производителя только при инициализации
    useEffect(() => {
        if (isInitialized && stableInitialData && categories.length > 0 && manufacturers.length > 0) {
            const category = categories.find(cat => cat.name === stableInitialData.category);
            const manufacturer = manufacturers.find(man => man.name === stableInitialData.manufacturer);
            
            setSelectedCategory(category || null);
            setSelectedManufacturer(manufacturer || null);
        }
    }, [isInitialized, stableInitialData, categories, manufacturers]);

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

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isSubmitting || isUpdating) {
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
    }, [formData, isSubmitting, isUpdating, onSubmit]);

    const handleClose = useCallback(() => {
        setIsInitialized(false);
        onClose();
    }, [onClose]);

    const isEditMode = Boolean(initialData);
    const isLoading = isSubmitting || isUpdating;

    return (
        <PopupOverlay>
            <PopupContainer>
                <h2>{isEditMode ? 'Редактировать оборудование' : 'Добавить оборудование'}</h2>
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
                    
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Сохранение...' : 'Сохранить'}
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