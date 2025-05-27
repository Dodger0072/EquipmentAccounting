// src/entities/session/model/index.ts
import { createStore } from 'effector';

// $isAuthenticated — это "хранилище", которое говорит: пользователь залогинен?
export const $isAuthenticated = createStore<boolean>(
  // Сначала проверяем localStorage — есть ли токен?
  !!localStorage.getItem('authToken')
);
