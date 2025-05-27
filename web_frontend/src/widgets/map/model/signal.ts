import { createEvent, createStore } from 'effector';

export const toggleShow = createEvent();

export const $showRadius = createStore(false).on(toggleShow, (state) => !state);
