import { getEquipmentImg } from '@/shared/lib/get-equipment-img';
import { Equipment } from '@/shared/types';
import { styled } from '@stitches/react';

type EquipmentItemProps = {
  equipment: Equipment;
  onClick: (equipment: Equipment) => void;
  showRadius?: boolean;
};

export const EquipmentItem = ({
  equipment,
  onClick,
  showRadius,
}: EquipmentItemProps) => {
  const circleStyle: React.CSSProperties = {
    borderRadius: '50%',
    border: `${showRadius && equipment.waveRadius ? '1px solid red' : ''}`,
    position: 'absolute',
    padding: `${equipment.waveRadius || 0}%`,
    transform: 'translate(-50%, -50%)',
    zIndex: 100,
    left: `${equipment.xCoord}%`,
    top: `${equipment.yCoord}%`,
  };

  return (
    <Container style={circleStyle}>
      {
        <img
          onClick={() => onClick(equipment)}
          src={getEquipmentImg(equipment.category)}
        />
      }
    </Container>
  );
};

const Container = styled('div', {
  position: 'absolute',
  width: '20px',
  '& > img': {
    width: '20px',
    cursor: 'pointer',
  },
});
