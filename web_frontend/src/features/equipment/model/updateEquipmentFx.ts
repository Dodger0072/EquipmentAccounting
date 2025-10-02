import axios from 'axios';
import { createEffect } from 'effector';
import { Equipment } from '@/shared/types';

export interface UpdateEquipmentParams {
  id: number;
  data: Partial<Equipment>;
}

export const updateEquipmentFx = createEffect<UpdateEquipmentParams, any, Error>(
  async ({ id, data }) => {
    try {
      console.log("updateEquipmentFx: Updating equipment", { id, data });
      
      // Подготавливаем данные для отправки
      const updateData = { ...data };
      
      // Обрабатываем пустые строки как null для опциональных полей
      if (updateData.softwareEndDate === '') {
        updateData.softwareEndDate = null;
      }
      if (updateData.updateDate === '') {
        updateData.updateDate = null;
      }
      if (updateData.mapId === undefined || updateData.mapId === 0) {
        updateData.mapId = null;
      }
      
      const response = await axios.put(`http://localhost:8000/update_device/${id}`, updateData);
      
      console.log("updateEquipmentFx: Update successful", response.data);
      return response.data;
    } catch (error) {
      console.error("updateEquipmentFx: Update failed", error);
      throw error;
    }
  }
);