import { useState, useEffect } from 'react';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { TextField } from '@consta/uikit/TextField';
import { Select } from '@consta/uikit/Select';
import { Modal } from '@consta/uikit/Modal';
import { styled } from '@stitches/react';
import { apiClient } from '@/shared/auth';
import type { User, Role } from '@/shared/auth';

type RoleOption = { label: string; id: Role };

const roleOptions: RoleOption[] = [
  { label: '\u0410\u0434\u043c\u0438\u043d\u0438\u0441\u0442\u0440\u0430\u0442\u043e\u0440', id: 'admin' },
  { label: '\u041e\u043f\u0435\u0440\u0430\u0442\u043e\u0440', id: 'operator' },
  { label: '\u0421\u0442\u0443\u0434\u0435\u043d\u0442', id: 'student' },
];

export const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '', full_name: '', email: '', role: 'student' as Role });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const { data } = await apiClient.get('/auth/users');
    setUsers(data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', password: '', full_name: '', email: '', role: 'student' });
    setError('');
    setIsModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', full_name: user.full_name, email: user.email || '', role: user.role });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (editingUser) {
        const payload: any = { full_name: form.full_name, email: form.email || null, role: form.role };
        if (form.username !== editingUser.username) payload.username = form.username;
        if (form.password) payload.password = form.password;
        await apiClient.put(`/auth/users/${editingUser.id}`, payload);
      } else {
        if (!form.password) { setError('\u041f\u0430\u0440\u043e\u043b\u044c \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u0435\u043d'); return; }
        await apiClient.post('/auth/users', {
          username: form.username,
          password: form.password,
          full_name: form.full_name,
          email: form.email || null,
          role: form.role,
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (e: any) {
      setError(e.response?.data?.detail || '\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f?')) return;
    try {
      await apiClient.delete(`/auth/users/${id}`);
      fetchUsers();
    } catch (e: any) {
      alert(e.response?.data?.detail || '\u041e\u0448\u0438\u0431\u043a\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f');
    }
  };

  const roleName = (r: string) => roleOptions.find((o) => o.id === r)?.label || r;

  return (
    <div>
      <HeaderRow>
        <Text size="2xl" weight="bold">{'\u0423\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f\u043c\u0438'}</Text>
        <Button label={'\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f'} size="m" view="primary" onClick={openCreate} />
      </HeaderRow>

      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>{'\u041b\u043e\u0433\u0438\u043d'}</Th>
            <Th>{'\u0424\u0418\u041e'}</Th>
            <Th>Email</Th>
            <Th>{'\u0420\u043e\u043b\u044c'}</Th>
            <Th>{'\u0410\u043a\u0442\u0438\u0432\u0435\u043d'}</Th>
            <Th>{'\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f'}</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>{u.id}</Td>
              <Td>{u.username}</Td>
              <Td>{u.full_name}</Td>
              <Td>{u.email || '\u2014'}</Td>
              <Td>{roleName(u.role)}</Td>
              <Td>{u.is_active ? '\u0414\u0430' : '\u041d\u0435\u0442'}</Td>
              <Td>
                <Button label={'\u0418\u0437\u043c\u0435\u043d\u0438\u0442\u044c'} size="xs" view="secondary" onClick={() => openEdit(u)} style={{ marginRight: 8 }} />
                <Button label={'\u0423\u0434\u0430\u043b\u0438\u0442\u044c'} size="xs" view="clear" onClick={() => handleDelete(u.id)} />
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      <Modal isOpen={isModalOpen} onClickOutside={() => setIsModalOpen(false)} onEsc={() => setIsModalOpen(false)}>
        <ModalContent>
          <Text size="xl" weight="bold" style={{ marginBottom: 16 }}>
            {editingUser ? '\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f' : '\u041d\u043e\u0432\u044b\u0439 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c'}
          </Text>
          <FormCol>
            <TextField label={'\u041b\u043e\u0433\u0438\u043d'} value={form.username} onChange={(value) => setForm({ ...form, username: value ?? '' })} size="m" />
            <TextField label={editingUser ? '\u041d\u043e\u0432\u044b\u0439 \u043f\u0430\u0440\u043e\u043b\u044c (\u043e\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u043f\u0443\u0441\u0442\u044b\u043c)' : '\u041f\u0430\u0440\u043e\u043b\u044c'} value={form.password} onChange={(value) => setForm({ ...form, password: value ?? '' })} type="password" size="m" />
            <TextField label={'\u0424\u0418\u041e'} value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value ?? '' })} size="m" />
            <TextField label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value ?? '' })} size="m" />
            <Select
              label={'\u0420\u043e\u043b\u044c'}
              items={roleOptions}
              value={roleOptions.find((o) => o.id === form.role) || null}
              onChange={(value) => value && setForm({ ...form, role: value.id })}
              getItemKey={(item: RoleOption) => item.id}
              getItemLabel={(item: RoleOption) => item.label}
              size="m"
            />
            {error && <Text size="s" view="alert">{error}</Text>}
            <ButtonRow>
              <Button label={'\u041e\u0442\u043c\u0435\u043d\u0430'} size="m" view="ghost" onClick={() => setIsModalOpen(false)} />
              <Button label={'\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'} size="m" view="primary" onClick={handleSubmit} />
            </ButtonRow>
          </FormCol>
        </ModalContent>
      </Modal>
    </div>
  );
};

const HeaderRow = styled('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 });
const Table = styled('table', { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' });
const Th = styled('th', { textAlign: 'left', padding: '12px 16px', background: '#f4f5f7', fontWeight: 600, fontSize: 14, color: '#555' });
const Tr = styled('tr', { '&:hover': { background: '#f9fafb' }, borderBottom: '1px solid #eee' });
const Td = styled('td', { padding: '10px 16px', fontSize: 14 });
const ModalContent = styled('div', { padding: 32, minWidth: 400 });
const FormCol = styled('div', { display: 'flex', flexDirection: 'column', gap: 16 });
const ButtonRow = styled('div', { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 });
