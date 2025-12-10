-- Скрипт для проверки структуры таблицы category
-- Выполните этот запрос, чтобы увидеть все поля таблицы category

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'category' 
ORDER BY ordinal_position;





