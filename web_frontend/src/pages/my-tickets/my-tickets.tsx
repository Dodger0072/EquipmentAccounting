import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import { Text } from '@consta/uikit/Text';

import { Button } from '@consta/uikit/Button';

import { styled } from '@stitches/react';

import { apiClient } from '@/shared/auth';

interface Ticket {

  id: number;

  device_id: number;

  device_name: string | null;

  title: string;

  description: string;

  status: string;

  created_at: string | null;

  closed_at: string | null;

}

const statusLabel = (s: string) => {

  if (s === 'open') return 'Открыт';

  if (s === 'in_progress') return 'В работе';

  return 'Закрыт';

};

const statusColor = (s: string): string => {

  if (s === 'open') return '#ef4444';

  if (s === 'in_progress') return '#f59e0b';

  return '#22c55e';

};

export const MyTicketsPage = () => {

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const navigate = useNavigate();

  useEffect(() => {

    apiClient.get('/tickets/my').then(({ data }) => setTickets(data));

  }, []);

  return (

    <div>

      <HeaderRow>

        <Text size="2xl" weight="bold">Мои обращения</Text>

        <Button label="Создать обращение" size="m" view="primary" onClick={() => navigate('/tickets/new')} />

      </HeaderRow>

      {tickets.length === 0 ? (

        <Text view="secondary">Вы ещё не создавали обращений</Text>

      ) : (

        <CardList>

          {tickets.map((t) => (

            <Card key={t.id}>

              <CardHeader>

                <Text size="m" weight="bold">{t.title}</Text>

                <StatusBadge css={{ background: statusColor(t.status) }}>

                  {statusLabel(t.status)}

                </StatusBadge>

              </CardHeader>

              <Text size="s" view="secondary">Оборудование: {t.device_name || `#${t.device_id}`}</Text>

              <Text size="s" style={{ marginTop: 8 }}>{t.description}</Text>

              <Text size="xs" view="ghost" style={{ marginTop: 8 }}>

                {t.created_at ? new Date(t.created_at).toLocaleString('ru-RU') : ''}

              </Text>

            </Card>

          ))}

        </CardList>

      )}

    </div>

  );

};

const HeaderRow = styled('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 });

const CardList = styled('div', { display: 'flex', flexDirection: 'column', gap: 16 });

const Card = styled('div', { background: '#fff', padding: 20, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' });

const CardHeader = styled('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 });

const StatusBadge = styled('span', { display: 'inline-block', padding: '2px 10px', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 600 });
