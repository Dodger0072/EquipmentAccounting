import React, { useEffect, useState } from 'react';
import { styled } from '@stitches/react';
import { Equipment } from '../../../../shared/types';

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
        manufacturer: '',
        xCord: undefined,
        yCord: undefined,
        waveRadius: undefined,
        mapId: undefined,
        place_id: '',
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                id: 0,
                name: '',
                category: '',
                releaseDate: '',
                softwareStartDate: '',
                softwareEndDate: '',
                manufacturer: '',
                xCord: undefined,
                yCord: undefined,
                waveRadius: undefined,
                mapId: undefined,
                place_id: '',
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("AddEquipmentPopup: handleSubmit triggered. Data to submit:", formData);
        onSubmit(formData);
    };

    const handleButtonClick = () => {
        console.log("AddEquipmentPopup: 'Сохранить' button clicked.");
    };

    return (
        <PopupOverlay>
            <PopupContainer>
                <h2>{initialData ? 'Редактировать оборудование' : 'Добавить оборудование'}</h2>
                <form onSubmit={handleSubmit}>
                    <InputField name="name" value={formData.name ?? ''} onChange={handleChange} placeholder="Название" required />
                    <InputField name="category" value={formData.category ?? ''} placeholder="Категория" onChange={handleChange} required />
                    <InputField name="releaseDate" value={formData.releaseDate ?? ''} type="date" onChange={handleChange} required />
                    <InputField name="softwareStartDate" type="date" value={formData.softwareStartDate ?? ''} onChange={handleChange} required />
                    <InputField name="softwareEndDate" type="date" value={formData.softwareEndDate ?? ''} onChange={handleChange} required />
                    <InputField name="manufacturer" placeholder="Производитель" value={formData.manufacturer ?? ''} onChange={handleChange} required />
                    <InputField name="place_id" placeholder="Место" value={formData.place_id ?? ''} onChange={handleChange} required />
                    <InputField name="xCord" type="number" placeholder="X Координата" value={formData.xCord ?? ''} onChange={handleChange} required />
                    <InputField name="yCord" type="number" placeholder="Y Координата" value={formData.yCord ?? ''} onChange={handleChange} required />
                    <InputField name="waveRadius" type="number" placeholder="Радиус волны" value={formData.waveRadius ?? ''} onChange={handleChange} required />
                    <InputField name="mapId" type="number" placeholder="ID карты" value={formData.mapId ?? ''} onChange={handleChange} required />

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
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    width: '400px',
});

const InputField = styled('input', {
    marginBottom: '12px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
    '&:focus': {
        borderColor: '#007bff',
        outline: 'none',
    },
});

const Button = styled('button', {
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '10px',
    '&:hover': {
        backgroundColor: '#0056b3',
    },
});

const CloseButton = styled(Button, {
    backgroundColor: '#6c757d',
    '&:hover': {
        backgroundColor: '#5a6268',
    },
});