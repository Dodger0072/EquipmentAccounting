import { createEvent, createStore } from 'effector';

export const setActiveClassroom = createEvent<string | null>();

export const $activeClassroom = createStore<string | null>(null).on(
  setActiveClassroom,
  (_, payload) => payload,
);






