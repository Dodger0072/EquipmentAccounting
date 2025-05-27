import { Place } from '@/shared/types/place';
import { createEffect, createEvent, createStore, sample } from 'effector';

export const setPlace = createEvent<Place | null>();

export const $places = createStore<Place[]>([]);
export const $place = createStore<Place | null>(null).on(
  setPlace,
  (_, place) => place,
);

export const fetchPlacesFx = createEffect(async () => {
  return new Promise<Place[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          label: 'Этаж 1',
          mapUrl: '/maps/map1.png',
        },
        {
          id: 2,
          label: 'Этаж 2',
          mapUrl: '/maps/map2.png',
        },
		{
          id: 3,
          label: 'Этаж 3',
          mapUrl: '/maps/map3.png',
        },
      ]);
    }, 100);
  });
});

sample({
  clock: fetchPlacesFx.doneData,
  target: $places,
});

sample({
  clock: fetchPlacesFx.doneData,
  fn: (places) => places[0],
  target: $place,
});
