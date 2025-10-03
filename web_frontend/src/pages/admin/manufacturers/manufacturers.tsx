import React, { useState, useEffect } from 'react';
import { styled } from '@stitches/react';
import { Button } from '@consta/uikit/Button';
import { Text } from '@consta/uikit/Text';
import { Modal } from '@consta/uikit/Modal';
import { Select } from '@consta/uikit/Select';
import { useUnit } from 'effector-react';
import { 
  $manufacturers, 
  $categories,
  $isLoading, 
  $error, 
  $editingManufacturer,
  $selectedCategory,
  fetchManufacturers, 
  fetchCategoriesFx,
  addManufacturerEvent, 
  updateManufacturerEvent, 
  deleteManufacturerEvent,
  setEditingManufacturer,
  setSelectedCategory
} from './model';
import { Manufacturer, Category } from '@/app/api';

export const ManufacturersPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', category_id: null as number | null });
  
  const [manufacturers, categories, isLoading, error, editingManufacturer, selectedCategory] = useUnit([
    $manufacturers,
    $categories,
    $isLoading,
    $error,
    $editingManufacturer,
    $selectedCategory
  ]);

  useEffect(() => {
    fetchManufacturers();
    fetchCategoriesFx();
  }, []);

  useEffect(() => {
    if (editingManufacturer) {
      setFormData({
        name: editingManufacturer.name,
        description: editingManufacturer.description || '',
        category_id: editingManufacturer.category_id
      });
      setIsModalOpen(true);
    }
  }, [editingManufacturer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      alert('Пожалуйста, выберите категорию');
      return;
    }
    if (editingManufacturer) {
      updateManufacturerEvent({ id: editingManufacturer.id, data: formData });
    } else {
      addManufacturerEvent(formData);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingManufacturer(null);
    setFormData({ name: '', description: '', category_id: null });
  };

  const handleEdit = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого производителя?')) {
      deleteManufacturerEvent(id);
    }
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  // Фильтрация производителей по выбранной категории
  const filteredManufacturers = selectedCategory 
    ? manufacturers.filter(m => m.category_id === selectedCategory)
    : [];

  const categoryOptions = categories.map(cat => ({
    label: cat.name,
    value: cat.id
  }));


  return (
    <Container>
      <Header>
        <Text size="2xl" weight="bold">
          {selectedCategory 
            ? `Производители категории "${categories.find(c => c.id === selectedCategory)?.name || 'Неизвестная'}"`
            : 'Управление производителями'
          }
        </Text>
        {selectedCategory && (
          <Button 
            label="Добавить производителя" 
            onClick={() => {
              setFormData({ name: '', description: '', category_id: selectedCategory });
              setIsModalOpen(true);
            }}
          />
        )}
      </Header>
      
      <FilterSection>
        <Text size="m" weight="medium">Фильтр по категории:</Text>
        <select
          value={selectedCategory ? selectedCategory.toString() : ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : null;
            handleCategoryFilter(value);
          }}
          style={{
            padding: '6px 12px',
            border: '1px solid #D1D5DB',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <option value="">Все категории</option>
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {selectedCategory && (
          <Button 
            size="s" 
            label="Сбросить фильтр" 
            view="ghost"
            onClick={() => handleCategoryFilter(null)}
          />
        )}
      </FilterSection>
      
      {error && (
        <ErrorMessage>
          <Text color="error">{error}</Text>
        </ErrorMessage>
      )}

      {selectedCategory ? (
        <Content>
          {isLoading ? (
            <Text>Загрузка...</Text>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>№</TableHeaderCell>
                  <TableHeaderCell>Название</TableHeaderCell>
                  <TableHeaderCell>Описание</TableHeaderCell>
                  <TableHeaderCell>Действия</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredManufacturers.map((manufacturer, index) => (
                  <TableRow key={manufacturer.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{manufacturer.name}</TableCell>
                    <TableCell>{manufacturer.description || '-'}</TableCell>
                    <TableCell>
                      <Button 
                        size="s" 
                        label="Редактировать" 
                        onClick={() => handleEdit(manufacturer)}
                      />
                      <Button 
                        size="s" 
                        label="Удалить" 
                        view="ghost"
                        onClick={() => handleDelete(manufacturer.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Content>
      ) : (
        <Content>
          <Text size="l" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Выберите категорию для просмотра производителей
          </Text>
        </Content>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>
            <Text size="xl" weight="bold">
              {editingManufacturer ? 'Редактировать производителя' : 'Добавить производителя'}
            </Text>
          </ModalHeader>
          
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label>Название производителя *</Label>
              <InputField
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название производителя"
                required
              />
            </FormField>
            
            <FormField>
              <Label>Категория *</Label>
              <select
                value={formData.category_id ? formData.category_id.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  setFormData({ ...formData, category_id: value });
                }}
                required
                disabled={!editingManufacturer && selectedCategory !== null}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: (!editingManufacturer && selectedCategory !== null) ? '#f3f4f6' : 'white',
                  cursor: (!editingManufacturer && selectedCategory !== null) ? 'not-allowed' : 'default'
                }}
              >
                <option value="">Выберите категорию</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
            
            <FormField>
              <Label>Описание</Label>
              <TextAreaField
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание производителя"
                rows={3}
              />
            </FormField>
            
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

    </Container>
  );
};

const Container = styled('div', {
  padding: '24px',
  maxWidth: '1200px',
  margin: '0 auto',
});

const Header = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
});

const FilterSection = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#F9FAFB',
  borderRadius: '8px',
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

const TableBody = styled('tbody', {
  // Стили для тела таблицы
});

const TableCell = styled('td', {
  padding: '12px',
  fontSize: '14px',
  color: '#374151',
});

const ModalContent = styled('div', {
  padding: '24px',
  backgroundColor: 'white',
  borderRadius: '8px',
  maxWidth: '500px',
  width: '100%',
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

