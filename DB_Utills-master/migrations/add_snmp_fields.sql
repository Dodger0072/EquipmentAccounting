-- Миграция для добавления SNMP полей в таблицу device
-- Выполнить: psql -d your_database -f add_snmp_fields.sql

-- Добавляем SNMP поля в таблицу device
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_enabled VARCHAR(10) DEFAULT 'false';
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_ip VARCHAR(45);
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_port INTEGER DEFAULT 161;
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_community VARCHAR(255) DEFAULT 'public';
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_version VARCHAR(10) DEFAULT '2c';
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_username VARCHAR(255);
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_password VARCHAR(255);
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_auth_protocol VARCHAR(10) DEFAULT 'MD5';
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_priv_protocol VARCHAR(10) DEFAULT 'DES';
ALTER TABLE device ADD COLUMN IF NOT EXISTS last_snmp_check DATE;
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_status VARCHAR(20) DEFAULT 'unknown';
ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_response_time FLOAT;

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_device_snmp_enabled ON device(snmp_enabled);
CREATE INDEX IF NOT EXISTS idx_device_snmp_status ON device(snmp_status);
CREATE INDEX IF NOT EXISTS idx_device_snmp_ip ON device(snmp_ip);

-- Комментарии к полям
COMMENT ON COLUMN device.snmp_enabled IS 'Включен ли SNMP мониторинг (true/false)';
COMMENT ON COLUMN device.snmp_ip IS 'IP адрес устройства для SNMP запросов';
COMMENT ON COLUMN device.snmp_port IS 'SNMP порт (по умолчанию 161)';
COMMENT ON COLUMN device.snmp_community IS 'SNMP community string';
COMMENT ON COLUMN device.snmp_version IS 'Версия SNMP (1, 2c, 3)';
COMMENT ON COLUMN device.snmp_username IS 'Имя пользователя для SNMPv3';
COMMENT ON COLUMN device.snmp_password IS 'Пароль для SNMPv3';
COMMENT ON COLUMN device.snmp_auth_protocol IS 'Протокол аутентификации для SNMPv3';
COMMENT ON COLUMN device.snmp_priv_protocol IS 'Протокол шифрования для SNMPv3';
COMMENT ON COLUMN device.last_snmp_check IS 'Дата и время последней SNMP проверки';
COMMENT ON COLUMN device.snmp_status IS 'Статус устройства (up, down, unknown)';
COMMENT ON COLUMN device.snmp_response_time IS 'Время отклика SNMP в миллисекундах';


