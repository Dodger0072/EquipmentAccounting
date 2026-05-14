
import { EquipmentPage, EquipmentViewPage, MapPage, SiteSearch, AboutPage, AboutProjectPage, ContactsPage, FAQPage, HelpPage, SupportPage, CategoriesPage, ManufacturersPage, ClassroomsPage} from '@/pages';
import { UsersPage } from '@/pages/admin/users';
import { TicketsPage } from '@/pages/tickets';
import { MyTicketsPage } from '@/pages/my-tickets';
import { CreateTicketPage } from '@/pages/create-ticket';
import type { Role } from '@/shared/auth';

export interface Route {
  path: string;
  name: string;
  element: JSX.Element;
  children?: Route[];
  roles?: Role[];
}

export const routes: Route[] = [
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
    roles: ['admin', 'operator'],
  },
  {
    path: '/admin',
    name: 'Администрирование',
    element: <CategoriesPage />,
    roles: ['admin'],
  },
  {
    path: '/admin/categories',
    name: 'Категории',
    element: <CategoriesPage />,
    roles: ['admin'],
  },
  {
    path: '/admin/manufacturers',
    name: 'Производители',
    element: <ManufacturersPage />,
    roles: ['admin'],
  },
  {
    path: '/admin/classrooms',
    name: 'Аудитории',
    element: <ClassroomsPage />,
    roles: ['admin'],
  },
  {
    path: '/admin/users',
    name: 'Пользователи',
    element: <UsersPage />,
    roles: ['admin'],
  },
  {
    path: '/tickets',
    name: 'Обращения',
    element: <TicketsPage />,
    roles: ['admin', 'operator'],
  },
  {
    path: '/my-tickets',
    name: 'Мои обращения',
    element: <MyTicketsPage />,
    roles: ['student'],
  },
  {
    path: '/tickets/new/:deviceId',
    name: 'Создать обращение',
    element: <CreateTicketPage />,
    roles: ['student'],
  },
  {
    path: '/tickets/new',
    name: 'Создать обращение',
    element: <CreateTicketPage />,
    roles: ['student'],
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
