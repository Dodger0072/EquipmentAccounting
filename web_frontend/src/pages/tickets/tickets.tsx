import { useState, useEffect } from 'react';

import { Text } from '@consta/uikit/Text';

import { Select } from '@consta/uikit/Select';

import { styled } from '@stitches/react';

import { apiClient } from '@/shared/auth';

interface Ticket {

  id: number;

  device_id: number;

  device_name: string | null;

  device_place: string | null;

  author_id: number;

  author_name: string | null;

  title: string;

  description: string;

  status: string;

  created_at: string | null;

  closed_at: string | null;

}

type StatusOption = { label: string; id: string };

const statusOptions: StatusOption[] = [

  { label: 'Открыт', id: 'open' },

  { label: 'В работе', id: 'in_progress' },

  { label: 'Закрыт', id: 'closed' },

];

const statusLabel = (s: string) => statusOptions.find((o) => o.id === s)?.label || s;

const statusColor = (s: string): string => {

  if (s === 'open') return '#ef4444';

  if (s === 'in_progress') return '#f59e0b';

  return '#22c55e';

};

export const TicketsPage = () => {

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = async () => {

    const { data } = await apiClient.get('/tickets');

    setTickets(data);

  };

  useEffect(() => { fetchTickets(); }, []);

  const handleStatusChange = async (ticketId: number, newStatus: string) => {

    await apiClient.put(`/tickets/${ticketId}/status`, { status: newStatus });

    fetchTickets();

  };

  return (

    <div>

      <Text size="2xl" weight="bold" style={{ marginBottom: 24 }}>Обращения о неисправностях</Text>

      {tickets.length === 0 ? (

        <Text view="secondary">Обращений пока нет</Text>

      ) : (

        <Table>

          <thead>

            <tr>

              <Th>ID</Th>

              <Th>Оборудование</Th>

              <Th>Место</Th>

              <Th>Автор</Th>

              <Th>Заголовок</Th>

              <Th>Статус</Th>

              <Th>Дата создания</Th>

              <Th>Действие</Th>

            </tr>

          </thead>

          <tbody>

            {tickets.map((t) => (

              <Tr key={t.id}>

                <Td>{t.id}</Td>

                <Td>{t.device_name || `#${t.device_id}`}</Td>

                <Td>{t.device_place || '\u2014'}</Td>

                <Td>{t.author_name || `#${t.author_id}`}</Td>

                <Td>

                  <Text size="s" weight="bold">{t.title}</Text>

                  <Text size="xs" view="secondary" style={{ marginTop: 2 }}>{t.description.slice(0, 80)}{t.description.length > 80 ? '...' : ''}</Text>

                </Td>

                <Td>

                  <StatusBadge css={{ background: statusColor(t.status) }}>

                    {statusLabel(t.status)}

                  </StatusBadge>

                </Td>

                <Td>{t.created_at ? new Date(t.created_at).toLocaleString('ru-RU') : '\u2014'}</Td>

                <Td>

                  <Select

                    items={statusOptions}

                    value={statusOptions.find((o) => o.id === t.status) || null}

                    onChange={(value) => value && handleStatusChange(t.id, value.id)}

                    getItemKey={(item: StatusOption) => item.id}

                    getItemLabel={(item: StatusOption) => item.label}

                    size="xs"

                  />

                </Td>

              </Tr>

            ))}

          </tbody>

        </Table>

      )}

    </div>

  );

};

const Table = styled('table', { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' });

const Th = styled('th', { textAlign: 'left', padding: '12px 16px', background: '#f4f5f7', fontWeight: 600, fontSize: 14, color: '#555' });

const Tr = styled('tr', { '&:hover': { background: '#f9fafb' }, borderBottom: '1px solid #eee' });

const Td = styled('td', { padding: '10px 16px', fontSize: 14, verticalAlign: 'top' });

const StatusBadge = styled('span', { display: 'inline-block', padding: '2px 10px', borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 600 });
