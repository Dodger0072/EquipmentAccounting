import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import {
  $place,
  $places,
  fetchPlacesFx,
  setPlace as setPlaceEv,
} from '../../model';

export const Place = () => {
  const [places, place, fetchPlaces, setPlace] = useUnit([
    $places,
    $place,
    fetchPlacesFx,
    setPlaceEv,
  ]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  return (
    <Select
      label='Место'
      items={places}
      value={place}
      onChange={(item) => setPlace(item || places[0])}
    />
  );
};
