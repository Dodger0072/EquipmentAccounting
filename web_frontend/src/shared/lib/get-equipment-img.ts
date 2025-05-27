import Desktop from '@/shared/assets/images/desktop.png';
import Image from '@/shared/assets/images/image.png';
import Router from '@/shared/assets/images/router.png';

export const getEquipmentImg = (category: string) => {
  switch (category) {
    case 'desktop':
      return Desktop;
    case 'router':
      return Router;
    default:
      return Image;
  }
};
