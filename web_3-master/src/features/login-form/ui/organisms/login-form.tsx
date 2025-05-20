import { TextField } from '@consta/uikit/TextField';
import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { FormEvent } from 'react';

import { loginForm, loginFx } from '../../model';
import { FormBottom } from '../molecules';
import { useForm } from 'effector-forms';

export const LoginForm = () => {
  const { fields, hasError, submit } = useForm(loginForm);
  const pending = useUnit(loginFx.pending);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit();
  };

  return (
    <Form onSubmit={onSubmit}>
      <TextField
        type='text'
        label='Username'
        value={fields.username.value}
        disabled={pending}
        onChange={(value) => fields.username.onChange(value || '')}
        status={hasError('username') ? 'alert' : undefined}
        caption={fields.username.errorText({ username: 'Username required' })}
        withClearButton
      />
      <TextField
        type='password'
        label='Password'
        value={fields.password.value}
        disabled={pending}
        onChange={(value) => fields.password.onChange(value || '')}
        status={hasError('password') ? 'alert' : undefined}
        caption={fields.password.errorText({ password: 'Password required' })}
        withClearButton
      />
      <FormBottom />
    </Form>
  );
};

const Form = styled('form', {
  width: '90%',
  maxWidth: '420px',
  padding: '32px',
  borderRadius: '4px',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
});
