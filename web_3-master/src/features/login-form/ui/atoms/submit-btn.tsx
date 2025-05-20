import { Button } from '@consta/uikit/Button';

import { loginForm } from '../../model';
import { useForm } from 'effector-forms';

export const SubmitButton = () => {
  const { eachValid } = useForm(loginForm);

  return <Button type='submit' label='Войти' disabled={!eachValid} />;
};
