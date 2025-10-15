import Image from '@/shared/assets/images/image.png';

// Импортируем SVG иконки
import DesktopIcon from '@/shared/assets/images/icons/desktop.svg';
import RouterIcon from '@/shared/assets/images/icons/router.svg';
import PrinterIcon from '@/shared/assets/images/icons/printer.svg';
import ServerIcon from '@/shared/assets/images/icons/server.svg';
import MonitorIcon from '@/shared/assets/images/icons/monitor.svg';
import LaptopIcon from '@/shared/assets/images/icons/laptop.svg';
import ProjectorIcon from '@/shared/assets/images/icons/projector.svg';
import NetworkIcon from '@/shared/assets/images/icons/network.svg';

// Массив доступных иконок (должен совпадать с IconPicker)
const iconMap: Record<string, string> = {
  desktop: DesktopIcon,
  router: RouterIcon,
  server: ServerIcon,
  printer: PrinterIcon,
  monitor: MonitorIcon,
  laptop: LaptopIcon,
  projector: ProjectorIcon,
  network: NetworkIcon,
  default: Image,
};

export const getEquipmentImg = (category: string, categoryIcon?: string) => {
  // Если передан icon из категории, используем его
  if (categoryIcon && iconMap[categoryIcon]) {
    return iconMap[categoryIcon];
  }
  
  // Иначе используем старую логику для обратной совместимости
  switch (category) {
    case 'desktop':
      return DesktopIcon;
    case 'router':
      return RouterIcon;
    default:
      return Image;
  }
};
