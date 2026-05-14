import { createBrowserRouter, RouterProvider, RouteObject, Navigate, Outlet } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { routes, Route } from './routes';
import { HomePage, LoginPage } from '@/pages';
import { $isAuth, $authChecked, $role } from '@/shared/auth';
import type { Role } from '@/shared/auth';
import { Text } from '@consta/uikit/Text';
import { styled } from '@stitches/react';

const ProtectedRoute = () => {
  const [isAuth, authChecked] = useUnit([$isAuth, $authChecked]);

  if (!authChecked) {
    return (
      <LoaderWrap>
        <Text size="l" view="secondary">Загрузка...</Text>
      </LoaderWrap>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const GuestOnlyRoute = () => {
  const [isAuth, authChecked] = useUnit([$isAuth, $authChecked]);

  if (!authChecked) {
    return (
      <LoaderWrap>
        <Text size="l" view="secondary">Загрузка...</Text>
      </LoaderWrap>
    );
  }

  if (isAuth) {
    return <Navigate to="/equipment" replace />;
  }

  return <Outlet />;
};

const RoleGuard = ({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) => {
  const role = useUnit($role);

  if (!role || !allowed.includes(role)) {
    return <Navigate to="/equipment" replace />;
  }

  return <>{children}</>;
};

const mapRoutes = (routeArray: Route[]): RouteObject[] => {
  return routeArray.map((route) => {
    const element = route.roles ? (
      <RoleGuard allowed={route.roles}>{route.element}</RoleGuard>
    ) : (
      route.element
    );

    return {
      path: route.path,
      element,
      children: route.children ? mapRoutes(route.children) : undefined,
    };
  });
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <GuestOnlyRoute />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <HomePage />,
        children: [
          {
            path: '/',
            element: <Navigate to="/equipment" replace />,
          },
          ...mapRoutes(routes),
        ],
      },
    ],
  },
]);

export const Provider = () => {
  return <RouterProvider router={router} />;
};

const LoaderWrap = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
});
