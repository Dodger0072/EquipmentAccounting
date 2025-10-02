import React, { useEffect, useState } from 'react';
import { styled } from '@stitches/react';
import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { Equipment } from '../../../../shared/types';
import { $categories, fetchCategories } from '@/pages/admin/categories/model';
import { $manufacturers, fetchManufacturers } from '@/pages/admin/manufacturers/model';

interface AddEquipmentPopupProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: Equipment;
}

export const AddEquipmentPopup: React.FC<AddEquipmentPopupProps> = ({ onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Equipment>(initialData || {
        id: 0,
        name: '',
        category: '',
        releaseDate: '',
        softwareStartDate: '',
        softwareEndDate: '',
        updateDate: '',
        manufacturer: '',
        xCord: 0,
        yCord: 0,
        waveRadius: undefined,
        mapId: undefined,
        place_id: '',
        version: '1.0',
    });

    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedManufacturer, setSelectedManufacturer] = useState<any>(null);
    const categories = useUnit($categories);
    const manufacturers = useUnit($manufacturers);

    useEffect(() => {
        fetchCategories();
        fetchManufacturers();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            // Найти выбранную категорию по названию
            const category = categories.find(cat => cat.name === initialData.category);
            setSelectedCategory(category || null);
            // Найти выбранного производителя по названию
            const manufacturer = manufacturers.find(man => man.name === initialData.manufacturer);
            setSelectedManufacturer(manufacturer || null);
        } else {
            setFormData({
                id: 0,
                name: '',
                category: '',
                releaseDate: '',
                softwareStartDate: '',
                softwareEndDate: '',
                updateDate: '',
                manufacturer: '',
                xCord: 0,
                yCord: 0,
                waveRadius: undefined,
                mapId: undefined,
                place_id: '',
                version: '1.0',
            });
            setSelectedCategory(null);
            setSelectedManufacturer(null);
        }
    }, [initialData, categories, manufacturers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: e.target.type === 'number' ? (value === '' ? 0 : Number(value)) : value
        }));
    };

    const handleCategoryChange = (value: any) => {
        setSelectedCategory(value);
        setFormData(prevFormData => ({
            ...prevFormData,
            category: value?.name || ''
        }));
        // Сбрасываем производителя при смене категории
        setSelectedManufacturer(null);
        setFormData(prevFormData => ({
            ...prevFormData,
            manufacturer: ''
        }));
    };

    const handleManufacturerChange = (value: any) => {
        setSelectedManufacturer(value);
        setFormData(prevFormData => ({
            ...prevFormData,
            manufacturer: value?.name || ''
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("AddEquipmentPopup: handleSubmit triggered. Data to submit:", formData);
        onSubmit(formData);
    };

    return (
        <PopupOverlay>
            <PopupContainer>
                <h2>{initialData ? 'Редактировать оборудование' : 'Добавить оборудование'}</h2>
                <form onSubmit={handleSubmit}>
                    <FormField>
                        <Label>Название *</Label>
                        <InputField name="name" value={formData.name ?? ''} onChange={handleChange} placeholder="Введите название оборудования" required />
                    </FormField>
                    
                    <FormField>
                        <Label>Категория *</Label>
                        <SelectField>
                            <Select
                                items={categories}
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                getItemLabel={(item) => item.name}
                                getItemKey={(item) => item.id.toString()}
                                placeholder="Выберите категорию"
                                required
                            />
                        </SelectField>
                    </FormField>
                    
                    <FormField>
                        <Label>Дата закупки *</Label>
                        <InputField name="releaseDate" value={formData.releaseDate ?? ''} type="date" onChange={handleChange} required />
                    </FormField>
                    
                    <FormField>
                        <Label>Дата устаревания *</Label>
                        <InputField name="softwareStartDate" type="date" value={formData.softwareStartDate ?? ''} onChange={handleChange} required />
                    </FormField>
                    
                    <FormField>
                        <Label>Дата снятия</Label>
                        <InputField name="softwareEndDate" type="date" value={formData.softwareEndDate ?? ''} onChange={handleChange} />
                    </FormField>
                    
                    <FormField>
                        <Label>Дата обновления ПО</Label>
                        <InputField name="updateDate" type="date" value={formData.updateDate ?? ''} onChange={handleChange} />
                    </FormField>
                    
                    <FormField>
                        <Label>Производитель *</Label>
                        <SelectField>
                            <Select
                                items={selectedCategory ? manufacturers.filter(man => man.category_id === selectedCategory.id) : manufacturers}
                                value={selectedManufacturer}
                                onChange={handleManufacturerChange}
                                getItemLabel={(item) => item.name}
                                getItemKey={(item) => item.id.toString()}
                                placeholder="Выберите производителя"
                                required
                            />
                        </SelectField>
                    </FormField>
                    
                    <FormField>
                        <Label>Версия *</Label>
                        <InputField name="version" placeholder="Введите версию" value={formData.version ?? '1.0'} onChange={handleChange} required />
                    </FormField>
                    
                    <FormField>
                        <Label>Место *</Label>
                        <InputField name="place_id" placeholder="Например: Admin Room" value={formData.place_id ?? ''} onChange={handleChange} required />
                    </FormField>
                    
                    <FormField>
                        <Label>X Координата *</Label>
                        <InputField name="xCord" type="number" placeholder="Введите X координату" value={formData.xCord ?? ''} onChange={handleChange} required />
                    </FormField>
                    
                    <FormField>
                        <Label>Y Координата *</Label>
                        <InputField name="yCord" type="number" placeholder="Введите Y координату" value={formData.yCord ?? ''} onChange={handleChange} required />
                    </FormField>
                    
                    <FormField>
                        <Label>Радиус волны</Label>
                        <InputField name="waveRadius" type="number" placeholder="Введите радиус волны" value={formData.waveRadius ?? ''} onChange={handleChange} />
                    </FormField>
                    
                    <FormField>
                        <Label>ID карты</Label>
                        <InputField name="mapId" type="number" placeholder="Введите ID карты" value={formData.mapId ?? ''} onChange={handleChange} />
                    </FormField>

                    <Button type="submit">Сохранить</Button>
                </form>
                <CloseButton onClick={onClose}>Закрыть</CloseButton>
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
});

const CloseButton = styled(Button, {
    backgroundColor: '#6b7280',
    '&:hover': {
        backgroundColor: '#4b5563',
    },
});