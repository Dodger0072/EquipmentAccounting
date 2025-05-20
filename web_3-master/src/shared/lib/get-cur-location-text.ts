export const getCurLocationText = (path: string) => {
  switch (path.toLowerCase()) {
    case '/':
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
    default:
      return 'Вы потерялись';
  }
};
