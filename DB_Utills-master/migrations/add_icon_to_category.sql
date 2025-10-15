-- Миграция для добавления поля icon в таблицу category
-- Выполнить в pgAdmin4 или через psql

-- Добавляем поле icon в таблицу category
ALTER TABLE category ADD COLUMN icon VARCHAR(50) DEFAULT 'default';

-- Обновляем существующие записи, устанавливая иконку по умолчанию
UPDATE category SET icon = 'default' WHERE icon IS NULL;

-- Делаем поле NOT NULL (после установки значений по умолчанию)
ALTER TABLE category ALTER COLUMN icon SET NOT NULL;

-- Добавляем комментарий к полю
COMMENT ON COLUMN category.icon IS 'Иконка категории для отображения на карте';