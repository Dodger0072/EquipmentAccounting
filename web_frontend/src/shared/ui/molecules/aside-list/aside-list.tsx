import { styled } from '@stitches/react';

import { Link } from '../../atoms';

export const AsideList = () => {
  return (
    <Nav>
      <Link to='/' text='Оборудование' />
      <Link to='/map' text='Карта' />
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
