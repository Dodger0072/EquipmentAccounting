-- Рефакторинг SNMP архитектуры
-- Удаляем SNMP поля из таблицы device и создаем отдельную таблицу

-- 1. Создаем новую таблицу для SNMP конфигурации
CREATE TABLE IF NOT EXISTS device_snmp_config (
    id SERIAL PRIMARY KEY,
    device_id INTEGER NOT NULL UNIQUE REFERENCES device(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL DEFAULT 161,
    community VARCHAR(255) DEFAULT 'public',
    version VARCHAR(10) NOT NULL DEFAULT '2c',
    username VARCHAR(255),
    password VARCHAR(255),
    auth_protocol VARCHAR(10) DEFAULT 'MD5',
    priv_protocol VARCHAR(10) DEFAULT 'DES',
    last_check TIMESTAMP,
    status VARCHAR(20) DEFAULT 'unknown',
    response_time FLOAT,
    timeout INTEGER DEFAULT 5,
    retries INTEGER DEFAULT 2,
    check_interval INTEGER DEFAULT 300,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_device_snmp_config_device_id ON device_snmp_config(device_id);
CREATE INDEX IF NOT EXISTS idx_device_snmp_config_enabled ON device_snmp_config(enabled);
CREATE INDEX IF NOT EXISTS idx_device_snmp_config_status ON device_snmp_config(status);
CREATE INDEX IF NOT EXISTS idx_device_snmp_config_ip ON device_snmp_config(ip_address);

-- 3. Мигрируем существующие SNMP данные (если есть)
INSERT INTO device_snmp_config (
    device_id, enabled, ip_address, port, community, version,
    username, password, auth_protocol, priv_protocol,
    last_check, status, response_time
)
SELECT 
    id as device_id,
    CASE WHEN snmp_enabled = 'true' THEN TRUE ELSE FALSE END as enabled,
    snmp_ip as ip_address,
    COALESCE(snmp_port, 161) as port,
    COALESCE(snmp_community, 'public') as community,
    COALESCE(snmp_version, '2c') as version,
    snmp_username,
    snmp_password,
    COALESCE(snmp_auth_protocol, 'MD5') as auth_protocol,
    COALESCE(snmp_priv_protocol, 'DES') as priv_protocol,
    last_snmp_check as last_check,
    COALESCE(snmp_status, 'unknown') as status,
    snmp_response_time as response_time
FROM device 
WHERE snmp_ip IS NOT NULL;

-- 4. Удаляем старые SNMP поля из таблицы device
ALTER TABLE device DROP COLUMN IF EXISTS snmp_enabled;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_ip;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_port;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_community;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_version;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_username;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_password;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_auth_protocol;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_priv_protocol;
ALTER TABLE device DROP COLUMN IF EXISTS last_snmp_check;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_status;
ALTER TABLE device DROP COLUMN IF EXISTS snmp_response_time;

-- 5. Удаляем старые индексы
DROP INDEX IF EXISTS idx_device_snmp_enabled;
DROP INDEX IF EXISTS idx_device_snmp_status;
DROP INDEX IF EXISTS idx_device_snmp_ip;

-- 6. Добавляем комментарии
COMMENT ON TABLE device_snmp_config IS 'SNMP конфигурация для мониторинга устройств';
COMMENT ON COLUMN device_snmp_config.device_id IS 'ID устройства';
COMMENT ON COLUMN device_snmp_config.enabled IS 'Включен ли SNMP мониторинг';
COMMENT ON COLUMN device_snmp_config.ip_address IS 'IP адрес устройства';
COMMENT ON COLUMN device_snmp_config.port IS 'SNMP порт';
COMMENT ON COLUMN device_snmp_config.community IS 'SNMP community string';
COMMENT ON COLUMN device_snmp_config.version IS 'Версия SNMP (1, 2c, 3)';
COMMENT ON COLUMN device_snmp_config.status IS 'Статус устройства (up, down, unknown)';
COMMENT ON COLUMN device_snmp_config.response_time IS 'Время отклика в миллисекундах';


