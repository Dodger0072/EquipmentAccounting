import axios from 'axios';
import { createEffect } from 'effector';

export const updateEquipmentFx = createEffect(async ({ id, data }: { id: number; data: any }) => {
  const response = await axios.put(`http://localhost:8000/update_device/${id}`, data);
  return response.data;
});