import { Place } from '@/shared/types/place';
import { createEffect, createEvent, createStore, sample } from 'effector';
import { getPlaces as getPlacesApi, Place as ApiPlace } from '@/app/api';

export const setPlace = createEvent<Place | null>();

export const $places = createStore<Place[]>([]);
export const $place = createStore<Place | null>(null).on(
  setPlace,
  (_, place) => place,
);

// Маппинг ID карт на URL изображений (можно вынести в конфиг или базу данных)
const mapIdToUrl: Record<number, string> = {
  2: '/maps/map2.jpg',
  3: '/maps/map3.jpg',
  4: '/maps/map4.jpg',
};

export const fetchPlacesFx = createEffect(async () => {
  try {
    const apiPlaces = await getPlacesApi();
    // Преобразуем API места в формат Place для фронтенда
    return apiPlaces.map((p: ApiPlace) => ({
      id: p.id,
      label: p.name,
      mapUrl: mapIdToUrl[p.id] || `/maps/map${p.id}.jpg`, // Fallback если URL не найден
    }));
  } catch (error) {
    console.error('Ошибка загрузки карт из API, используем запасной вариант:', error);
    // Fallback на захардкоженные данные если API недоступен
    return [
      {
        id: 2,
        label: 'Этаж 2',
        mapUrl: '/maps/map2.jpg',
      },
      {
        id: 3,
        label: 'Этаж 3',
        mapUrl: '/maps/map3.jpg',
      },
      {
        id: 4,
        label: 'Этаж 4',
        mapUrl: '/maps/map4.jpg',
      },
    ];
  }
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
