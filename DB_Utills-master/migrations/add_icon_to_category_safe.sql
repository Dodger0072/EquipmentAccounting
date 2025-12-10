-- Безопасная миграция для добавления поля icon в таблицу category
-- Эта версия проверяет, существует ли поле, прежде чем добавлять его

-- Проверяем, существует ли поле icon, и добавляем его только если его нет
DO $$ 
BEGIN
    -- Проверяем, существует ли колонка icon
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'category' 
        AND column_name = 'icon'
    ) THEN
        -- Добавляем поле icon
        ALTER TABLE category ADD COLUMN icon VARCHAR(50) DEFAULT 'default';
        
        -- Обновляем существующие записи
        UPDATE category SET icon = 'default' WHERE icon IS NULL;
        
        -- Делаем поле NOT NULL
        ALTER TABLE category ALTER COLUMN icon SET NOT NULL;
        
        -- Добавляем комментарий
        COMMENT ON COLUMN category.icon IS 'Иконка категории для отображения на карте';
        
        RAISE NOTICE 'Поле icon успешно добавлено в таблицу category';
    ELSE
        RAISE NOTICE 'Поле icon уже существует в таблице category';
    END IF;
END $$;





