import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Text } from '@consta/uikit/Text';
import { TextField } from '@consta/uikit/TextField';
import { Button } from '@consta/uikit/Button';
import { styled } from '@stitches/react';
import { apiClient } from '@/shared/auth';

export const CreateTicketPage = () => {
  const navigate = useNavigate();
  const { deviceId } = useParams<{ deviceId?: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deviceIdInput, setDeviceIdInput] = useState(deviceId || '');
  const [deviceName, setDeviceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      apiClient.get(`/equipment/${deviceId}`).then(({ data }) => {
        setDeviceName(data.name || '');
      }).catch(() => {});
    }
  }, [deviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceIdInput || !title || !description) {
      setError('\u0412\u0441\u0435 \u043f\u043e\u043b\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/tickets', {
        device_id: parseInt(deviceIdInput, 10),
        title,
        description,
      });
      navigate('/my-tickets', { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Ошибка создания обращения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Text size="2xl" weight="bold" style={{ marginBottom: 24 }}>{'\u0421\u043e\u043e\u0431\u0449\u0438\u0442\u044c \u043e \u043d\u0435\u0438\u0441\u043f\u0440\u0430\u0432\u043d\u043e\u0441\u0442\u0438'}</Text>
      <CardEl>
        <Form onSubmit={handleSubmit}>
          <TextField
            label={'ID \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f'}
            value={deviceIdInput}
            onChange={(value) => setDeviceIdInput(value ?? '')}
            size="m"
            disabled={!!deviceId}
          />
          {deviceName && (
            <Text size="s" view="secondary">{'\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435: '}{deviceName}</Text>
          )}
          <TextField
            label={'\u0417\u0430\u0433\u043e\u043b\u043e\u0432\u043e\u043a'}
            value={title}
            onChange={(value) => setTitle(value ?? '')}
            placeholder={'\u041a\u0440\u0430\u0442\u043a\u043e \u043e\u043f\u0438\u0448\u0438\u0442\u0435 \u043f\u0440\u043e\u0431\u043b\u0435\u043c\u0443'}
            size="m"
          />
          <TextField
            label={'\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435'}
            value={description}
            onChange={(value) => setDescription(value ?? '')}
            placeholder={'\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0435 \u043e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u043d\u0435\u0438\u0441\u043f\u0440\u0430\u0432\u043d\u043e\u0441\u0442\u0438'}
            size="m"
            type="textarea"
            rows={5}
          />
          {error && <Text size="s" view="alert">{error}</Text>}
          <ButtonRow>
            <Button label={'\u041e\u0442\u043c\u0435\u043d\u0430'} size="m" view="ghost" onClick={() => navigate(-1)} />
            <Button label={loading ? '\u041e\u0442\u043f\u0440\u0430\u0432\u043a\u0430...' : '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c'} type="submit" size="m" view="primary" disabled={loading} />
          </ButtonRow>
        </Form>
      </CardEl>
    </Wrapper>
  );
};

const Wrapper = styled('div', { maxWidth: 600 });
const CardEl = styled('div', { background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' });
const Form = styled('form', { display: 'flex', flexDirection: 'column', gap: 16 });
const ButtonRow = styled('div', { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 });
