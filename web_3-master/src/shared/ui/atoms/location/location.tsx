import { getCurLocationText } from '@/shared/lib/get-cur-location-text';
import { Text } from '@consta/uikit/Text';
import { useLocation } from 'react-router-dom';

export const Location = () => {
  const location = useLocation();

  return <Text size='2xl'>{getCurLocationText(location.pathname)}</Text>;
};
