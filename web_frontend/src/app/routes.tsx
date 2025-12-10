
import { EquipmentPage, EquipmentViewPage, MapPage, SiteSearch, AboutPage, AboutProjectPage, ContactsPage, FAQPage, HelpPage, SupportPage, CategoriesPage, ManufacturersPage} from '@/pages';

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
    path: '/equipment',
    name: 'Оборудование',
    element: <EquipmentPage />,
  },
  {
    path: '/equipment/:id',
    name: 'Просмотр оборудования',
    element: <EquipmentViewPage />,
  },
      {
        path: '/map',
        name: 'Карта',
        element: <MapPage />,
      },
      {
        path: '/admin',
        name: 'Администрирование',
        element: <CategoriesPage />, // Заглушка для родительского маршрута
      },
      {
        path: '/admin/categories',
        name: 'Категории',
        element: <CategoriesPage />,
      },
      {
        path: '/admin/manufacturers',
        name: 'Производители',
        element: <ManufacturersPage />,
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

];
