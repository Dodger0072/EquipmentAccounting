import React, { useState, useEffect } from 'react';
import { styled } from '@stitches/react';
import { Button } from '@consta/uikit/Button';
import { Text } from '@consta/uikit/Text';
import { Modal } from '@consta/uikit/Modal';
import { useUnit } from 'effector-react';
import { 
  $categories, 
  $isLoading, 
  $error, 
  $editingCategory,
  fetchCategories, 
  addCategoryEvent, 
  updateCategoryEvent, 
  deleteCategoryEvent,
  setEditingCategory 
} from './model';
import { Category } from '@/app/api';

export const CategoriesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const [categories, isLoading, error, editingCategory] = useUnit([
    $categories,
    $isLoading,
    $error,
    $editingCategory
  ]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || ''
      });
      setIsModalOpen(true);
    }
  }, [editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategoryEvent({ id: editingCategory.id, data: formData });
    } else {
      addCategoryEvent(formData);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      deleteCategoryEvent(id);
    }
  };

  return (
    <Container>
      <Header>
        <Text size="2xl" weight="bold">Управление категориями</Text>
        <Button 
          label="Добавить категорию" 
          onClick={() => setIsModalOpen(true)}
        />
      </Header>
      
      {error && (
        <ErrorMessage>
          <Text color="error">{error}</Text>
        </ErrorMessage>
      )}

      <Content>
        {isLoading ? (
          <Text>Загрузка...</Text>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Название</TableHeaderCell>
                <TableHeaderCell>Описание</TableHeaderCell>
                <TableHeaderCell>Действия</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <Button 
                      size="s" 
                      label="Редактировать" 
                      onClick={() => handleEdit(category)}
                    />
                    <Button 
                      size="s" 
                      label="Удалить" 
                      view="ghost"
                      onClick={() => handleDelete(category.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Content>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalContent>
          <ModalHeader>
            <Text size="xl" weight="bold">
              {editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
            </Text>
          </ModalHeader>
          
          <form onSubmit={handleSubmit}>
            <FormField>
              <Label>Название категории *</Label>
              <InputField
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Введите название категории"
                required
              />
            </FormField>
            
            <FormField>
              <Label>Описание</Label>
              <TextAreaField
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Введите описание категории"
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

