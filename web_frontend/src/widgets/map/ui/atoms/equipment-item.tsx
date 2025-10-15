import { getEquipmentImg } from '@/shared/lib/get-equipment-img';
import { Equipment } from '@/shared/types';
import { styled } from '@stitches/react';

type EquipmentItemProps = {
  equipment: Equipment;
  onClick: (equipment: Equipment) => void;
};

export const EquipmentItem = ({
  equipment,
  onClick,
}: EquipmentItemProps) => {
  const circleStyle: React.CSSProperties = {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    zIndex: 100,
    left: `${equipment.xCord}%`,
    top: `${equipment.yCord}%`,
  };

  return (
    <Container style={circleStyle}>
      <img
        onClick={() => onClick(equipment)}
        src={getEquipmentImg(equipment.category, equipment.categoryIcon)}
        alt={equipment.name}
      />
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
