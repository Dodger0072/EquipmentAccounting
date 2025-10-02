import { Equipment } from '@/entities';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { Header } from '..';
import { $items, fetchEquipmentFx, deleteEquipment } from '../../model';
import { updateEquipmentFx } from '@/features/equipment/model/updateEquipmentFx';
import { Filter } from './filter';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Types, getType } from '@/shared/lib/get-type';
import axios from 'axios';
import { Equipment as EquipmentType } from '@/shared/types';
import { AddEquipmentPopup } from './euipment-popup';

export const EquipmentList: React.FC = () => {
    const equipmentList = useUnit($items);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedEquipmentCategory, setSelectedEquipmentCategory] = useState<string | null>(null);
    const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);

    const setIsPopupOpenRef = useRef(setIsPopupOpen);
    setIsPopupOpenRef.current = setIsPopupOpen;

    const setEditingEquipmentRef = useRef(setEditingEquipment);
    setEditingEquipmentRef.current = setEditingEquipment;


    useEffect(() => {
        fetchEquipmentFx();
    }, []);

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
            await fetchEquipmentFx();
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
            waveRadius: data.waveRadius ? parseNumber(data.waveRadius) : undefined,
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
            await axios.post<{ id: number }>('http://localhost:8000/add_device', numericData);
            console.log("EquipmentList: handleAddEquipment - POST request successful.");
            await fetchEquipmentFx();
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

    const handleUpdateEquipment = useCallback(async (updatedData: EquipmentType) => {
        console.log("EquipmentList: handleUpdateEquipment called with data:", updatedData);

        try {
            console.log("EquipmentList: Calling updateEquipmentFx...");
            await updateEquipmentFx({ id: updatedData.id, data: updatedData });
            console.log("EquipmentList: updateEquipmentFx finished.");

            console.log("EquipmentList: Calling fetchEquipmentFx...");
            await fetchEquipmentFx();
            console.log("EquipmentList: fetchEquipmentFx finished.");

            alert("Оборудование обновлено");
            return true;
        } catch (error) {
            console.error('EquipmentList: Ошибка обновления в handleUpdateEquipment:', error);
            alert('Не удалось обновить оборудование');
            return false;
        }
    }, []);

    const handleSubmitFromPopup = useCallback(async (data: any) => {
        console.log("EquipmentList: handleSubmitFromPopup called. Data:", data);

        let success = false;
        if (editingEquipment) {
            console.log("EquipmentList: handleSubmitFromPopup -> calling handleUpdateEquipment...");
            success = await handleUpdateEquipment(data);
            console.log("EquipmentList: handleSubmitFromPopup -> handleUpdateEquipment finished. Success:", success);
        } else {
            console.log("EquipmentList: handleSubmitFromPopup -> calling handleAddEquipment...");
            success = await handleAddEquipment(data);
            console.log("EquipmentList: handleSubmitFromPopup -> handleAddEquipment finished. Success:", success);
        }

        if (success) {
            console.log("EquipmentList: handleSubmitFromPopup -> Closing popup.");
            setIsPopupOpenRef.current(false);
            setEditingEquipmentRef.current(null);
        } else {
            console.log("EquipmentList: handleSubmitFromPopup -> Not closing popup due to failure.");
        }
    }, [editingEquipment, handleUpdateEquipment, handleAddEquipment]);


    return (
        <StyledContainer>
            <Filter 
                onSearch={setSearchTerm} 
                onCategoryChange={setSelectedCategoryId}
                onEquipmentCategoryChange={setSelectedEquipmentCategory}
                onFloorChange={setSelectedFloor}
            />
            <Header />
            <AddButton onClick={() => {
                setEditingEquipment(null);
                setIsPopupOpen(true);
            }}>
                Добавить оборудование
            </AddButton>
            {filteredEquipment.map((equipment, index) => (
                <Equipment
                    key={`eq-${equipment.id}`}
                    equipment={equipment}
                    displayNumber={index + 1}
                    onDelete={() => handleDeleteEquipment(equipment.id)}
                    onUpdate={() => {
                        setEditingEquipment(equipment);
                        setIsPopupOpen(true);
                    }}
                />
            ))}

            {isPopupOpen && (
                <AddEquipmentPopup
                    key={editingEquipment ? editingEquipment.id : 'new-equipment'}
                    initialData={editingEquipment || undefined}
                    onSubmit={handleSubmitFromPopup}
                    onClose={() => {
                        console.log("EquipmentList: onClose from popup called.");
                        setIsPopupOpen(false);
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
