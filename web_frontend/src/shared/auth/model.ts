import { createEvent, createStore, createEffect, sample } from 'effector';
import type { User, Role, TokenPair } from './types';
import { loginApi, getMeApi, clearTokens, getStoredAccessToken } from './api';

export const loginFx = createEffect(
  async ({ username, password }: { username: string; password: string }) => {
    await loginApi(username, password);
    return getMeApi();
  },
);

export const getMeFx = createEffect(async () => {
  return getMeApi();
});

export const logout = createEvent();

export const $user = createStore<User | null>(null)
  .on(loginFx.doneData, (_, user) => user)
  .on(getMeFx.doneData, (_, user) => user)
  .reset(logout);

export const $isAuth = $user.map((user) => user !== null);
export const $role = $user.map((user) => (user ? user.role : null) as Role | null);
export const setAuthChecked = createEvent();

export const $authChecked = createStore(false)
  .on(getMeFx.finally, () => true)
  .on(loginFx.doneData, () => true)
  .on(setAuthChecked, () => true);

sample({
  clock: logout,
  fn: () => {
    clearTokens();
  },
});

export function initAuth() {
  const token = getStoredAccessToken();
  if (token) {
    getMeFx();
  } else {
    setAuthChecked();
  }
}
