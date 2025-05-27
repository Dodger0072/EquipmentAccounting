import { useUnit } from 'effector-react';

import { loginFx } from '../../model';
import { Loader, SubmitButton } from '../atoms';

export const FormBottom = () => {
  const isLoading = useUnit(loginFx.pending);

  return <>{isLoading ? <Loader /> : <SubmitButton />}</>;
};
