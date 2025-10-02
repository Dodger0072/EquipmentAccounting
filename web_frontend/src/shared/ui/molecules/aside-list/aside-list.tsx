import { styled } from '@stitches/react';

import { Link, DropdownLink } from '../../atoms';

export const AsideList = () => {
  return (
    <Nav>
      <Link to='/' text='Оборудование' />
      <Link to='/map' text='Карта' />
      <DropdownLink 
        text='Администрирование'
        children={[
          { to: '/admin/categories', text: 'Категории' },
          { to: '/admin/manufacturers', text: 'Производители' }
        ]}
      />
      <Link to='/search' text='Поиск по сайту'/>
      <Link to='/about' text='О сайте'/>
      <Link to='/help' text='Помощь'/>
    </Nav>
  );
};

const Nav = styled('nav', {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});
