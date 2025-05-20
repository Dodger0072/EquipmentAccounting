// src/router.tsx
import { createBrowserRouter, RouterProvider, RouteObject  } from 'react-router-dom';
import { routes, Route } from './routes';
import { HomePage } from '@/pages';


const mapRoutes = (routeArray: Route[]): RouteObject[] => {
  return routeArray.map((route) => ({
    path: route.path,
    element: route.element,
    children: route.children ? mapRoutes(route.children) : undefined,
  }));
};

console.log(mapRoutes(routes))

const router = createBrowserRouter([
  {
    element: <HomePage />, // Оборачиваем все страницы в макет
    children: mapRoutes(routes), // Вложенные маршруты
  },
]);

export const Provider = () => {
  return <RouterProvider router={router} />;
};