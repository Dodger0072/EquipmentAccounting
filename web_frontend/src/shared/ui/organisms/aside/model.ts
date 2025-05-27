import { createEvent, createStore } from 'effector';

export const triggerSidebar = createEvent();

export const $isSidebarOpen = createStore(false).on(
  triggerSidebar,
  (state) => !state,
);
