-- Удаляем ограничение уникальности для поля name в таблице manufacturer
-- Это позволит иметь производителей с одинаковыми названиями в разных категориях

-- Сначала нужно найти имя ограничения уникальности
-- Обычно SQLAlchemy создает их как uq_manufacturer_name или manufacturer_name_key

-- Удаляем ограничение уникальности (имя может отличаться в зависимости от версии SQLAlchemy)
ALTER TABLE manufacturer DROP CONSTRAINT IF EXISTS uq_manufacturer_name;
ALTER TABLE manufacturer DROP CONSTRAINT IF EXISTS manufacturer_name_key;
ALTER TABLE manufacturer DROP CONSTRAINT IF EXISTS manufacturer_name_unique;

-- Если используется PostgreSQL, можно также попробовать:
-- ALTER TABLE manufacturer DROP CONSTRAINT IF EXISTS manufacturer_name_key;

-- Для MySQL:
-- ALTER TABLE manufacturer DROP INDEX IF EXISTS uq_manufacturer_name;
-- ALTER TABLE manufacturer DROP INDEX IF EXISTS manufacturer_name;

-- Проверяем, что ограничение удалено
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'manufacturer' AND constraint_type = 'UNIQUE';




