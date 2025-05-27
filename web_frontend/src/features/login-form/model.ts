import { createEffect, sample } from 'effector';
import { createForm } from 'effector-forms';
import axios from 'axios';

export const loginFx = createEffect(async ({ username, password} : {
  username: string;
  password: string;
}) => {
  const response = await axios.post('http://localhost:8000/login', {
    username,
    password,
  })
  const { token } = response.data;
  localStorage.setItem('authToken', token);

  return token;
});

export const loginForm = createForm({
  fields: {
    username: {
      init: '',
      rules: [
        {
          name: 'username',
          validator: (value: string) => !!value,
        },
      ],
    },
    password: {
      init: '',
      rules: [
        {
          name: 'password',
          validator: (value: string) => !!value,
        },
      ],
    },
  },
  validateOn: ['submit'],
});


sample({
  clock: loginForm.formValidated,
  target: loginFx,
});
