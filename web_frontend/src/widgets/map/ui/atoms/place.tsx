import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { useEffect } from 'react';
import { styled } from '@stitches/react';
import { Place as PlaceType } from '@/shared/types/place';

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
    <Container>
      <Select
        label='Этаж'
        items={places}
        value={place}
        onChange={(item) => setPlace(item || places[0])}
        getItemLabel={(item: PlaceType) => item.label}
        getItemKey={(item: PlaceType) => item.id.toString()}
      />
    </Container>
  );
};

const Container = styled('div', {
  minWidth: '220px',
  width: '100%',
  '& > *': {
    width: '100%',
  },
});
