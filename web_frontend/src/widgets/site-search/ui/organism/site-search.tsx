import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/app/routes';
import { styled } from '@stitches/react';

interface Route {
  path: string;
  name: string;
  parent?: string;
}

const getAllRoutes = (routeArray: { path: string; name: string; children?: any[] }[]): Route[] => {
  return routeArray.flatMap((route) => {
    const routeName = route.name;
    if (route.children) {
      return [
        { name: routeName, path: route.path },
        ...getAllRoutes(route.children).map((child) => ({
          ...child,
          parent: routeName,
        })),
      ];
    }
    return [{ name: routeName, path: route.path }];
  });
};

export const SiteSearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const allRoutes = getAllRoutes(routes);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredRoutes = allRoutes.filter((route) =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h1>Поиск по сайту</h1>
      <SearchInput
        type="text"
        placeholder="Поиск..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <h2>Разделы сайта</h2>
      <List>
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map((route) => (
            <ListItem key={route.path} hasParent={!!route.parent}>
              <StyledLink to={route.path}>{route.name}</StyledLink>
            </ListItem>
          ))
        ) : (
          <ListItem>Нет совпадений</ListItem>
        )}
      </List>
    </Container>
  );
};

// Стили
const Container = styled('div', {
  padding: '20px',
});

const SearchInput = styled('input', {
  padding: '10px',
  width: '100%',
  marginBottom: '20px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '16px',
});

const List = styled('ul', {
  listStyleType: 'none',
  padding: 0,
});

const ListItem = styled('li', {
  margin: '5px 0',
  padding: '10px 15px',
  borderRadius: '4px',
  backgroundColor: '#f9f9f9',
  transition: 'background-color 0.3s, transform 0.3s',
  '&:hover': {
    backgroundColor: '#e0e0e0',
    transform: 'scale(1.02)',
  },
  variants: {
    hasParent: {
      true: {
        paddingLeft: '30px',
        fontWeight: 'normal',
        backgroundColor: '#f2f2f2',
      },
      false: {
        fontWeight: 'bold',
        backgroundColor: '#d1e7dd',
      },
    },
  },
});

const StyledLink = styled(Link, {
  textDecoration: 'none', // Убираем подчеркивание
  color: 'inherit', // Наследуем цвет
  '&:hover': {
    color: 'inherit', // Цвет при наведении
  },
});
