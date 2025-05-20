// src/routes/routes.ts
import { EquipmentPage, LoginPage, MapPage, SiteSearch, AboutPage, AboutProjectPage, ContactsPage, FAQPage, HelpPage, SupportPage} from '@/pages';

export  interface Route {
  path: string;
  name: string;
  element: JSX.Element;
  children?: Route[];
}

export const routes: Route[] = [
  {
        path: '/',
        name: 'Оборудование',
        element: <EquipmentPage />,
      },
      {
        path: '/map',
        name: 'Карта',
        element: <MapPage />,
      },
      {
        path: '/search',
        name: 'Поиск',
        element: <SiteSearch />,
      },
      {
        path: '/about',
        name: 'О сайте',
        element: <AboutPage />,
        children: [
          {
            path: '/about/project',
            name: 'О проекте',
            element: <AboutProjectPage />,
          },
          {
            path: '/about/contacts',
            name: 'Контакты',
            element: <ContactsPage />,
          },
        ],
      },
      {
        path: '/help',
        name: 'Помощь',
        element: <HelpPage />,
        children: [
          {
            path: '/help/faq',
            name: 'Часто задаваемые вопросы',
            element: <FAQPage />,
          },
          {
            path: '/help/support',
            name: 'Поддержка',
            element: <SupportPage />,
          },
        ],
  },
  {
    path: '/login',
    name: 'Авторизация',
    element: <LoginPage />
  },
];
