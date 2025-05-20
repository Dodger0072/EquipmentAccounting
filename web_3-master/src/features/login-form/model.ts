import { createEffect, sample } from 'effector';
import { createForm } from 'effector-forms';

// TODO: rewrite without using effector-forms
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

export const loginFx = createEffect(() => {
  console.log('HELLO');
});

sample({
  clock: loginForm.formValidated,
  target: loginFx,
});
