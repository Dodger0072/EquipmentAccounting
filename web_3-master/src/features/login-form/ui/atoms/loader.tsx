import { Loader as ConstaLoader } from '@consta/uikit/Loader';
import { styled } from '@stitches/react';

export const Loader = () => {
  return <ConstaLoaderStyled />;
};

const ConstaLoaderStyled = styled(ConstaLoader, {
  marginInline: 'auto',
});
