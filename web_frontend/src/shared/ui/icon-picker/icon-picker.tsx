import { styled } from '@stitches/react';
import { Text } from '@consta/uikit/Text';

// Импортируем PNG иконку по умолчанию
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

const availableIcons = [
  { id: 'desktop', name: 'Компьютер', icon: DesktopIcon },
  { id: 'router', name: 'Роутер', icon: RouterIcon },
  { id: 'server', name: 'Сервер', icon: ServerIcon },
  { id: 'printer', name: 'Принтер', icon: PrinterIcon },
  { id: 'monitor', name: 'Монитор', icon: MonitorIcon },
  { id: 'laptop', name: 'Ноутбук', icon: LaptopIcon },
  { id: 'projector', name: 'Проектор', icon: ProjectorIcon },
  { id: 'network', name: 'Сетевое оборудование', icon: NetworkIcon },
  { id: 'default', name: 'По умолчанию', icon: Image },
];

type IconPickerProps = {
  selectedIcon: string;
  onIconSelect: (iconId: string) => void;
};

export const IconPicker = ({ selectedIcon, onIconSelect }: IconPickerProps) => {
  return (
    <Container>
      <Text size="s" weight="bold" style={{ marginBottom: '12px' }}>
        Выберите иконку для категории:
      </Text>
      <IconsGrid>
        {availableIcons.map((icon) => (
          <IconItem
            key={icon.id}
            isSelected={selectedIcon === icon.id}
            onClick={() => onIconSelect(icon.id)}
          >
            <IconImage src={icon.icon} alt={icon.name} />
            <IconLabel>{icon.name}</IconLabel>
          </IconItem>
        ))}
      </IconsGrid>
    </Container>
  );
};

const Container = styled('div', {
  marginBottom: '20px',
});

const IconsGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
  gap: '12px',
  maxHeight: '200px',
  overflowY: 'auto',
  padding: '8px',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  backgroundColor: '#fafafa',
});

const IconItem = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '8px',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '2px solid transparent',
  
  '&:hover': {
    backgroundColor: '#f0f0f0',
    transform: 'scale(1.05)',
  },
  
  variants: {
    isSelected: {
      true: {
        backgroundColor: '#e3f2fd',
        borderColor: '#2196f3',
        transform: 'scale(1.05)',
      },
    },
  },
});

const IconImage = styled('img', {
  width: '32px',
  height: '32px',
  objectFit: 'contain',
  marginBottom: '4px',
});

const IconLabel = styled(Text, {
  fontSize: '10px',
  textAlign: 'center',
  lineHeight: 1.2,
  color: '#666',
});
