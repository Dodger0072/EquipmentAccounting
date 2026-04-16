import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@stitches/react';
import { Button } from '@consta/uikit/Button';
import { Text } from '@consta/uikit/Text';
import { Modal } from '@consta/uikit/Modal';
import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { 
  $classrooms, 
  $isLoading, 
  $error, 
  $editingClassroom,
  $errorModalOpen,
  $errorDevices,
  $currentClassroomId,
  $successMessage,
  fetchClassrooms, 
  addClassroomEvent, 
  updateClassroomEvent, 
  deleteClassroomEvent,
  setEditingClassroom,
  setErrorModalOpen,
  deleteDeviceEvent,
  setCurrentClassroomId,
  setSuccessMessage
} from './model';
import { Classroom } from '@/app/api';
import { Place } from '@/shared/types/place';
import { $places, fetchPlacesFx } from '@/widgets/map/model';

// Стили
const Container = styled('div', {
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
});

const Header = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const Content = styled('div', {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
});

const ErrorMessage = styled('div', {
  padding: '12px',
  backgroundColor: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: '6px',
  marginBottom: '16px',
});

const SuccessMessage = styled('div', {
  padding: '12px',
  backgroundColor: '#F0FDF4',
  border: '1px solid #BBF7D0',
  borderRadius: '6px',
  marginBottom: '16px',
});

const Table = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
});

const TableHeader = styled('thead', {
  backgroundColor: '#F9FAFB',
});

const TableRow = styled('tr', {
  borderBottom: '1px solid #E5E7EB',
});

const TableHeaderCell = styled('th', {
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '14px',
  color: '#374151',
});

const TableBody = styled('tbody', {});

const TableCell = styled('td', {
  padding: '12px',
  fontSize: '14px',
  color: '#374151',
});

const ModalContent = styled('div', {
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '8px',
  maxWidth: '900px',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
});

const ModalHeader = styled('div', {
  marginBottom: '24px',
});

const FormField = styled('div', {
  marginBottom: '16px',
});

const Label = styled('label', {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: '500',
  color: '#374151',
});

const InputField = styled('input', {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #D1D5DB',
  borderRadius: '6px',
  fontSize: '14px',
  '&:focus': {
    outline: 'none',
    borderColor: '#3B82F6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
});

const TextAreaField = styled('textarea', {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #D1D5DB',
  borderRadius: '6px',
  fontSize: '14px',
  resize: 'vertical',
  minHeight: '80px',
  '&:focus': {
    outline: 'none',
    borderColor: '#3B82F6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
});

const ButtonGroup = styled('div', {
  display: 'flex',
  gap: '12px',
  justifyContent: 'flex-end',
  marginTop: '24px',
});

const MapEditorContainer = styled('div', {
  position: 'relative',
  border: '2px solid #E5E7EB',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '16px',
  backgroundColor: '#F9FAFB',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  maxWidth: '1000px',
  margin: '0 auto',
});

const MapImage = styled('img', {
  maxWidth: '100%',
  maxHeight: '600px',
  width: 'auto',
  height: 'auto',
  display: 'block',
  cursor: 'crosshair',
  objectFit: 'contain',
});

const PolygonOverlay = styled('svg', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 1,
});

const PointMarker = styled('div', {
  position: 'absolute',
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: '#3B82F6',
  border: '2px solid white',
  transform: 'translate(-50%, -50%)',
  cursor: 'pointer',
  pointerEvents: 'auto',
  '&:hover': {
    backgroundColor: '#2563EB',
    transform: 'translate(-50%, -50%) scale(1.2)',
  },
});

const Instructions = styled('div', {
  padding: '12px',
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '6px',
  marginBottom: '16px',
  fontSize: '14px',
  color: '#1E40AF',
});

const ErrorModalContent = styled('div', {
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '8px',
  maxWidth: '600px',
  width: '100%',
  maxHeight: '80vh',
  overflow: 'auto',
});

const DevicesList = styled('div', {
  maxHeight: '300px',
  overflowY: 'auto',
  border: '1px solid #E5E7EB',
  borderRadius: '6px',
  padding: '12px',
  marginBottom: '16px',
});

const DeviceItem = styled('div', {
  padding: '8px 0',
  borderBottom: '1px solid #F3F4F6',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&:last-child': {
    borderBottom: 'none',
  },
});

const DeviceInfo = styled('div', {
  flex: 1,
});

interface PolygonEditorProps {
  mapUrl: string;
  polygon: Array<{ x: number; y: number }>;
  onPolygonChange: (polygon: Array<{ x: number; y: number }>) => void;
}

const PolygonEditor: React.FC<PolygonEditorProps> = ({ mapUrl, polygon, onPolygonChange }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      const updateSize = () => {
        setImageSize({ width: img.offsetWidth, height: img.offsetHeight });
      };
      img.addEventListener('load', updateSize);
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => {
        img.removeEventListener('load', updateSize);
        window.removeEventListener('resize', updateSize);
      };
    }
  }, [mapUrl]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onPolygonChange([...polygon, { x, y }]);
  };

  const handlePointClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (event.button === 0) {
      // Левая кнопка - удалить точку
      onPolygonChange(polygon.filter((_, i) => i !== index));
    }
  };

  const getPolygonPath = () => {
    if (!imageSize || polygon.length < 2 || !imageRef.current) return '';
    const img = imageRef.current;
    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;
    
    // Масштабируем координаты из процентов относительно реального размера
    // в координаты относительно отображаемого размера
    const scaleX = imageSize.width / naturalWidth;
    const scaleY = imageSize.height / naturalHeight;
    
    return polygon.map((p, i) => {
      const realX = (p.x / 100) * naturalWidth;
      const realY = (p.y / 100) * naturalHeight;
      const displayX = realX * scaleX;
      const displayY = realY * scaleY;
      return `${i === 0 ? 'M' : 'L'} ${displayX} ${displayY}`;
    }).join(' ') + ' Z';
  };

  return (
    <MapEditorContainer>
      <MapImage ref={imageRef} src={mapUrl} alt="Карта для редактирования" onClick={handleImageClick} />
      {imageSize && (
        <PolygonOverlay width={imageSize.width} height={imageSize.height}>
          {polygon.length >= 2 && (
            <polygon
              points={polygon.map(p => `${(p.x / 100) * imageSize.width},${(p.y / 100) * imageSize.height}`).join(' ')}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="#3B82F6"
              strokeWidth="2"
            />
          )}
        </PolygonOverlay>
      )}
      {polygon.map((point, index) => (
        <PointMarker
          key={index}
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
          }}
          onMouseDown={(e) => handlePointClick(index, e)}
          title={`Точка ${index + 1}. Кликните для удаления`}
        />
      ))}
    </MapEditorContainer>
  );
};

export const ClassroomsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', map_id: null as number | null, description: '', polygon: [] as Array<{ x: number; y: number }> });
  const [places] = useUnit([$places]);
  
  const [classrooms, isLoading, error, editingClassroom, errorModalOpen, errorDevices, currentClassroomId, successMessage] = useUnit([
    $classrooms,
    $isLoading,
    $error,
    $editingClassroom,
    $errorModalOpen,
    $errorDevices,
    $currentClassroomId,
    $successMessage
  ]);

  useEffect(() => {
    fetchPlacesFx();
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (editingClassroom) {
      setFormData({
        name: editingClassroom.name,
        map_id: editingClassroom.map_id,
        description: editingClassroom.description || '',
        polygon: editingClassroom.polygon_coordinates
      });
      setIsModalOpen(true);
    }
  }, [editingClassroom]);

  const selectedPlace = places.find(p => p.id === formData.map_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.polygon.length < 3) {
      alert('Необходимо добавить минимум 3 точки для создания полигона');
      return;
    }
    // Преобразуем polygon в polygon_coordinates для отправки на сервер
    const submitData = {
      name: formData.name,
      map_id: formData.map_id!,
      description: formData.description,
      polygon_coordinates: formData.polygon
    };
    if (editingClassroom) {
      updateClassroomEvent({ id: editingClassroom.id, data: submitData });
    } else {
      addClassroomEvent(submitData);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClassroom(null);
    setFormData({ name: '', map_id: null, description: '', polygon: [] });
  };

  const handleEdit = (classroom: Classroom) => {
    setEditingClassroom(classroom);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту аудиторию?')) {
      setCurrentClassroomId(id);
      deleteClassroomEvent(id);
    }
  };

  const handleDeleteDevice = (deviceId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это устройство?')) {
      deleteDeviceEvent(deviceId);
    }
  };

  const handleCloseErrorModal = () => {
    setErrorModalOpen(false);
    setCurrentClassroomId(null);
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <Container>
      <Header>
        <Text size="2xl" weight="bold">Управление аудиториями</Text>
        <Button 
          label="Добавить аудиторию" 
          onClick={() => setIsModalOpen(true)}
        />
      </Header>
      
      {error && (
        <ErrorMessage>
          <Text color="error">{error}</Text>
        </ErrorMessage>
      )}

      {successMessage && (
        <SuccessMessage>
          <Text color="success">{successMessage}</Text>
        </SuccessMessage>
      )}

      <Content>
        {isLoading ? (
          <Text>Загрузка...</Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>№</TableHeaderCell>
                <TableHeaderCell>Название</TableHeaderCell>
                <TableHeaderCell>Карта</TableHeaderCell>
                <TableHeaderCell>Действия</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.map((classroom, index) => {
                const place = places.find(p => p.id === classroom.map_id);
                return (
                  <TableRow key={classroom.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{classroom.name}</TableCell>
                    <TableCell>{place?.label || `Карта ${classroom.map_id}`}</TableCell>
                    <TableCell>
                      <Button 
                        size="s" 
                        label="Редактировать" 
                        onClick={() => handleEdit(classroom)}
                      />
                      <Button 
                        size="s" 
                        label="Удалить" 
                        view="ghost"
                        onClick={() => handleDelete(classroom.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Content>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>
            <Text size="xl" weight="bold">
              {editingClassroom ? 'Редактировать аудиторию' : 'Добавить аудиторию'}
            </Text>
          </ModalHeader>
          
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label>Название аудитории *</Label>
              <InputField
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Аудитория 279"
                required
              />
            </FormField>
            
            <FormField>
              <Label>Карта (этаж) *</Label>
              <Select
                items={places}
                value={places.find(p => p.id === formData.map_id) || null}
                onChange={(item) => setFormData({ ...formData, map_id: item?.id || null, polygon: [] })}
                getItemLabel={(item: Place) => item.label}
                getItemKey={(item: Place) => item.id.toString()}
                placeholder="Выберите карту"
              />
            </FormField>
            
            <FormField>
              <Label>Описание</Label>
              <TextAreaField
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание аудитории"
                rows={3}
              />
            </FormField>

            {formData.map_id && selectedPlace && (
              <FormField>
                <Label>Область аудитории на карте *</Label>
                <Instructions>
                  Кликните на карте, чтобы добавить точки полигона. Минимум 3 точки. 
                  Кликните на точку, чтобы удалить её.
                </Instructions>
                <PolygonEditor
                  mapUrl={selectedPlace.mapUrl}
                  polygon={formData.polygon}
                  onPolygonChange={(polygon) => setFormData({ ...formData, polygon })}
                />
                <Text size="s" color="secondary" style={{ marginTop: '8px' }}>
                  Добавлено точек: {formData.polygon.length} (минимум 3)
                </Text>
              </FormField>
            )}
            
            <ButtonGroup>
              <Button type="submit" label="Сохранить" />
              <Button 
                type="button" 
                label="Отмена" 
                view="ghost"
                onClick={handleCloseModal}
              />
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>

      <Modal isOpen={errorModalOpen} onClose={handleCloseErrorModal}>
        <ErrorModalContent>
          <ModalHeader>
            <Text size="xl" weight="bold" color="error">
              Ошибка удаления аудитории
            </Text>
          </ModalHeader>
          
          <ErrorMessage>
            <Text>
              Нельзя удалить эту аудиторию, так как к ней привязаны следующие устройства:
            </Text>
          </ErrorMessage>
          
          <DevicesList>
            {errorDevices.map((device, index) => (
              <DeviceItem key={index}>
                <DeviceInfo>
                  <Text weight="medium">{device.name}</Text>
                  <Text size="s" color="secondary">
                    ID: {device.id} | Категория: {device.category || 'Не указано'}
                  </Text>
                </DeviceInfo>
                <Button 
                  size="s" 
                  label="Удалить" 
                  view="ghost"
                  onClick={() => handleDeleteDevice(device.id)}
                />
              </DeviceItem>
            ))}
          </DevicesList>
          
          <ButtonGroup>
            <Button 
              label="Понятно" 
              onClick={handleCloseErrorModal}
            />
          </ButtonGroup>
        </ErrorModalContent>
      </Modal>
    </Container>
  );
};

