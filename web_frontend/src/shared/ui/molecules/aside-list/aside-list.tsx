import { styled } from '@stitches/react';
import { useUnit } from 'effector-react';
import { $role } from '@/shared/auth';
import type { Role } from '@/shared/auth';

import { Link, DropdownLink } from '../../atoms';

export const AsideList = () => {
  const role = useUnit($role);

  return (
    <Nav>
      <Link to='/' text='Оборудование' />

      {(role === 'admin' || role === 'operator') && (
        <Link to='/map' text='Карта' />
      )}

      {role === 'admin' && (
        <DropdownLink
          text='Администрирование'
          children={[
            { to: '/admin/categories', text: 'Категории' },
            { to: '/admin/manufacturers', text: 'Производители' },
            { to: '/admin/classrooms', text: 'Аудитории' },
            { to: '/admin/users', text: 'Пользователи' },
          ]}
        />
      )}

      {(role === 'admin' || role === 'operator') && (
        <Link to='/tickets' text='Обращения' />
      )}

      {role === 'student' && (
        <>
          <Link to='/my-tickets' text='Мои обращения' />
          <Link to='/tickets/new' text='Создать обращение' />
        </>
      )}

      <Link to='/search' text='Поиск по сайту' />
      <Link to='/about' text='О сайте' />
      <Link to='/help' text='Помощь' />
    </Nav>
  );
};

const Nav = styled('nav', {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});
