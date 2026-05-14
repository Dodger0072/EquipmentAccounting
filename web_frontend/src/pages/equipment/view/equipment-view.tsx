import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUnit } from 'effector-react';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { styled } from '@stitches/react';
import { getEquipmentById } from '@/app/api';
import { Equipment } from '@/shared/types/equipment';
import { getType } from '@/shared/lib/get-type';
import { $role } from '@/shared/auth';

export const EquipmentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useUnit($role);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      if (!id) {
        setError('ID оборудования не указан');
        setLoading(false);
        return;
      }

      try {
        const data = await getEquipmentById(Number(id));
        setEquipment(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки оборудования');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id]);

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Не указано';
    try {
      return new Date(date).toLocaleDateString('ru-RU');
    } catch {
      return date;
    }
  };

  const getSNMPStatusText = (status?: string) => {
    switch (status) {
      case 'up':
        return 'Работает';
      case 'down':
      case 'error':
        return 'Не отвечает';
      case 'disabled':
        return 'Отключен';
      default:
        return 'Неизвестно';
    }
  };

  const getSNMPStatusColor = (status?: string) => {
    switch (status) {
      case 'up':
        return '#10b981';
      case 'down':
      case 'error':
        return '#ef4444';
      case 'disabled':
        return '#6b7280';
      default:
        return '#f59e0b';
    }
  };

  if (loading) {
    return (
      <Container>
        <Text size="l">Загрузка...</Text>
      </Container>
    );
  }

  if (error || !equipment) {
    return (
      <Container>
        <Text size="l" color="alert">
          {error || 'Оборудование не найдено'}
        </Text>
        <Button label="Вернуться назад" onClick={() => navigate(-1)} />
      </Container>
    );
  }

  const type = getType(equipment.softwareEndDate || '');
  const snmpStatus = equipment.snmp_status?.status || equipment.snmp_config?.status || 'unknown';

  return (
    <Container>
      <Header>
        <Button label="← Назад" onClick={() => navigate(-1)} view="ghost" />
        <Title>Информация об оборудовании</Title>
      </Header>

      <Content>
        <Card>
          <CardHeader>
            <EquipmentName>{equipment.name}</EquipmentName>
            {equipment.snmp_config?.enabled && (
              <SNMPBadge status={snmpStatus}>
                <SNMPDot status={snmpStatus} />
                <Text size="s">{getSNMPStatusText(snmpStatus)}</Text>
              </SNMPBadge>
            )}
          </CardHeader>

          <InfoGrid>
            <InfoRow>
              <InfoLabel>Категория:</InfoLabel>
              <InfoValue>{equipment.category || 'Не указано'}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Производитель:</InfoLabel>
              <InfoValue>{equipment.manufacturer || 'Не указано'}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Версия:</InfoLabel>
              <InfoValue>{equipment.version || 'Не указано'}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Местоположение:</InfoLabel>
              <InfoValue>{equipment.place_id || 'Не указано'}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Дата закупки:</InfoLabel>
              <InfoValue>{formatDate(equipment.releaseDate)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Дата устаревания:</InfoLabel>
              <InfoValue>{formatDate(equipment.softwareStartDate)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Дата снятия:</InfoLabel>
              <InfoValue>{formatDate(equipment.softwareEndDate)}</InfoValue>
            </InfoRow>

            <InfoRow>
              <InfoLabel>Дата обновления:</InfoLabel>
              <InfoValue>{formatDate(equipment.updateDate)}</InfoValue>
            </InfoRow>

            {equipment.snmp_config && (
              <>
                <InfoRow>
                  <InfoLabel>SNMP IP:</InfoLabel>
                  <InfoValue>{equipment.snmp_config.ip_address || 'Не указано'}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>SNMP Порт:</InfoLabel>
                  <InfoValue>{equipment.snmp_config.port || 'Не указано'}</InfoValue>
                </InfoRow>
                {equipment.snmp_status?.response_time && (
                  <InfoRow>
                    <InfoLabel>Время отклика:</InfoLabel>
                    <InfoValue>{Math.round(equipment.snmp_status.response_time)} мс</InfoValue>
                  </InfoRow>
                )}
              </>
            )}
          </InfoGrid>

          <StatusBadge type={type}>
            <Text size="s">
              {type === 'warning' && '⚠ Требует внимания'}
              {type === 'alert' && '⚠ Устарело'}
              {type === 'normal' && '✓ В норме'}
            </Text>
          </StatusBadge>

          {role === 'student' && (
            <ReportButton>
              <Button
                label="Сообщить о неисправности"
                size="m"
                view="primary"
                onClick={() => navigate(`/tickets/new/${id}`)}
              />
            </ReportButton>
          )}
        </Card>
      </Content>
    </Container>
  );
};

const Container = styled('div', {
  minHeight: '100vh',
  padding: '24px',
  backgroundColor: '#f9fafb',
  '@media (max-width: 768px)': {
    padding: '12px',
  },
});

const Header = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
  flexWrap: 'wrap',
});

const Title = styled(Text, {
  fontSize: '22px',
  fontWeight: '600',
  '@media (max-width: 768px)': {
    fontSize: '18px',
  },
});

const Content = styled('div', {
  maxWidth: '800px',
  margin: '0 auto',
});

const Card = styled('div', {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  '@media (max-width: 768px)': {
    padding: '16px',
  },
});

const CardHeader = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
  paddingBottom: '16px',
  borderBottom: '1px solid #e5e7eb',
  flexWrap: 'wrap',
  gap: '12px',
});

const EquipmentName = styled(Text, {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  '@media (max-width: 768px)': {
    fontSize: '20px',
  },
});

const SNMPBadge = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '6px',
  backgroundColor: '#f3f4f6',
});

const SNMPDot = styled('div', {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  variants: {
    status: {
      up: { backgroundColor: '#10b981' },
      down: { backgroundColor: '#ef4444' },
      error: { backgroundColor: '#ef4444' },
      disabled: { backgroundColor: '#6b7280' },
      unknown: { backgroundColor: '#f59e0b' },
    },
  },
  defaultVariants: {
    status: 'unknown',
  },
});

const InfoGrid = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  marginBottom: '24px',
});

const InfoRow = styled('div', {
  display: 'grid',
  gridTemplateColumns: '160px 1fr',
  gap: '12px',
  padding: '10px 0',
  borderBottom: '1px solid #f3f4f6',
  '&:last-child': {
    borderBottom: 'none',
  },
  '@media (max-width: 600px)': {
    gridTemplateColumns: '1fr',
    gap: '4px',
  },
});

const InfoLabel = styled(Text, {
  fontWeight: '600',
  color: '#6b7280',
});

const InfoValue = styled(Text, {
  color: '#111827',
});

const ReportButton = styled('div', {
  marginTop: '20px',
  display: 'flex',
  justifyContent: 'flex-end',
});

const StatusBadge = styled('div', {
  padding: '12px 16px',
  borderRadius: '8px',
  marginTop: '24px',
  variants: {
    type: {
      warning: {
        backgroundColor: '#fef3c7',
        color: '#92400e',
      },
      alert: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
      },
      normal: {
        backgroundColor: '#d1fae5',
        color: '#065f46',
      },
    },
  },
  defaultVariants: {
    type: 'normal',
  },
});






