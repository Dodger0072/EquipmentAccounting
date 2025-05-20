import { Equipment } from '@/entities';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Header } from '..';
import { $items, addItem } from '../../model'; 
import { Filter } from './filter';
import { useState } from 'react';
import { Types, getType } from '@/shared/lib/get-type';
import { AddEquipmentPopup } from './euipment-popup';
import axios from 'axios';

export const EquipmentList: React.FC = () => {
    const equipmentList = useUnit($items);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Состояние для управления поп-апом

    const filteredEquipment = equipmentList.filter((equipment) => {
        const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Логика фильтрации по категории
        let matchesCategory = true;
        if (selectedCategoryId === 2) { // Устаревающие
            matchesCategory = getType(equipment.sowftwareEndDate) === Types.warning;
        } else if (selectedCategoryId === 3) { // Устаревшие
            matchesCategory = getType(equipment.sowftwareEndDate) === Types.alert;
        }

        return matchesSearch && matchesCategory;
    });

    const handleAddEquipment = async (data: any) => {
        const equipmentData = {
            name: data.name,
            category: data.category,
            releaseDate: data.releaseDate,
            softwareStartDate: data.softwareStartDate,
            softwareEndDate: data.softwareEndDate,
            manufacturer: data.manufacturer,
            xCoord: data.xCoord,
            yCoord: data.yCoord,
            waveRadius: data.waveRadius,
            mapID: data.mapID
        };

        console.log("Отправляемые данные:", equipmentData); // Логируем отправляемые данные

        try {
            const response = await axios.post('http://localhost:8000/add_device', equipmentData);

            addItem(response.data.device);

            alert('Оборудование добавлено успешно!');
            console.log(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Ошибка при добавлении оборудования:', error.response?.data);
                alert(`Ошибка: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
            } else {
                console.error('Ошибка:', error);
                alert('Произошла ошибка при добавлении оборудования.');
            }
        }
    };


    return (
        <StyledContainer>
            <Filter onSearch={setSearchTerm} onCategoryChange={setSelectedCategoryId} />
            <Header />
            <AddButton onClick={() => setIsPopupOpen(true)}>Добавить оборудование</AddButton>
            {filteredEquipment.map((equipment) => (
                <Equipment equipment={equipment} key={equipment.id} />
            ))}
            {isPopupOpen && (
                <AddEquipmentPopup onClose={() => setIsPopupOpen(false)} onSubmit={handleAddEquipment} />
            )}
        </StyledContainer>
    );
};

const StyledContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
});

const AddButton = styled('button', {
    margin: '16px 0',
    padding: '10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: '#0056b3',
    },
});
