export const getCurLocationText = (path: string) => {
  switch (path.toLowerCase()) {
    case '/':
      return 'Оборудование';
    case '/equipment':
      return 'Оборудование';
    case '/map':
      return 'Карта';
    case '/search':
      return 'Поиск по сайту'
    case '/about':
      return 'О сайте'
    case '/about/project':
      return 'О сайте'
    case '/about/contacts':
      return 'О сайте'
    case '/help':
        return 'Помощь'
    case '/help/faq':
        return 'Помощь'
    case '/help/support':
        return 'Помощь'
    case '/admin':
      return 'Администрирование'
    case '/admin/categories':
      return 'Администрирование'
    case '/admin/manufacturers':
      return 'Администрирование'
    case '/admin/classrooms':
      return 'Администрирование'
    default:
      return 'Оборудование';
  }
};
