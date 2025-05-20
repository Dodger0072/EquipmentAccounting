import React, { useState } from 'react';
import { styled } from '@stitches/react';

interface AddEquipmentPopupProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
}

export const AddEquipmentPopup: React.FC<AddEquipmentPopupProps> = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        releaseDate: '',
        softwareStartDate: '',
        softwareEndDate: '',
        manufacturer: '',
        place_id: 0,
        xCoord: 0,
        yCoord: 0,
        waveRadius: 0,
        mapId: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const numericFields = ['xCoord', 'yCoord', 'waveRadius', 'mapId', 'place_id'];

        setFormData({
            ...formData,
            [name]: numericFields.includes(name) ? parseFloat(value) : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Преобразуем даты в формат YYYY-MM-DD
        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0];
        };

        const equipmentData = {
            name: formData.name,
            category: formData.category,
            releaseDate: formatDate(formData.releaseDate),
            softwareStartDate: formatDate(formData.softwareStartDate),
            softwareEndDate: formatDate(formData.softwareEndDate),
            manufacturer: formData.manufacturer,
            place_id: formData.place_id,
            xCoord: formData.xCoord,
            yCoord: formData.yCoord,
            waveRadius: formData.waveRadius,
            id: formData.mapId,  // Используем mapId как id устройства
            mapId: formData.mapId
        };

        console.log("Отправляемые данные:", equipmentData);

        try {
            const response = await fetch('http://localhost:8000/add_device', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(equipmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Ошибка: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            onSubmit(data);
            onClose();
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка при добавлении устройства: ' + error.message);
        }
    };

    return (
        <PopupOverlay>
            <PopupContainer>
                <h2>Добавить оборудование</h2>
                <form onSubmit={handleSubmit}>
                    <InputField name="name" placeholder="Название" onChange={handleChange} required />
                    <InputField name="category" placeholder="Категория" onChange={handleChange} required />
                    <InputField name="releaseDate" type="date" onChange={handleChange} required />
                    <InputField name="softwareStartDate" type="date" onChange={handleChange} required />
                    <InputField name="softwareEndDate" type="date" onChange={handleChange} required />
                    <InputField name="manufacturer" placeholder="Производитель" onChange={handleChange} required />
                    <InputField name="place_id" placeholder="ID места" type="number" onChange={handleChange} required />
                    <InputField name="xCoord" type="number" placeholder="X Координата" onChange={handleChange} required />
                    <InputField name="yCoord" type="number" placeholder="Y Координата" onChange={handleChange} required />
                    <InputField name="waveRadius" type="number" placeholder="Радиус волны" onChange={handleChange} required />
                    <InputField name="mapId" type="number" placeholder="ID карты" onChange={handleChange} required />
                    <Button type="submit">Добавить</Button>
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
