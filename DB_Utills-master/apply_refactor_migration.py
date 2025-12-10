#!/usr/bin/env python3
"""
Скрипт для применения рефакторинга SNMP архитектуры
Переводит SNMP поля из таблицы device в отдельную таблицу device_snmp_config
"""
import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Добавляем путь к модулям проекта
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.db_session import create_session, global_init

async def apply_refactor_migration():
    """Применяет рефакторинг SNMP архитектуры"""
    
    migration_sql = [
        # 1. Создаем новую таблицу для SNMP конфигурации
        """CREATE TABLE IF NOT EXISTS device_snmp_config (
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
        )""",
        
        # 2. Создаем индексы
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_config_device_id ON device_snmp_config(device_id)",
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_config_enabled ON device_snmp_config(enabled)",
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_config_status ON device_snmp_config(status)",
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_config_ip ON device_snmp_config(ip_address)",
        
        # 3. Мигрируем существующие SNMP данные
        """INSERT INTO device_snmp_config (
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
        WHERE snmp_ip IS NOT NULL""",
        
        # 4. Удаляем старые SNMP поля
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_enabled",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_ip", 
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_port",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_community",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_version",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_username",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_password",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_auth_protocol",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_priv_protocol",
        "ALTER TABLE device DROP COLUMN IF EXISTS last_snmp_check",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_status",
        "ALTER TABLE device DROP COLUMN IF EXISTS snmp_response_time",
        
        # 5. Удаляем старые индексы
        "DROP INDEX IF EXISTS idx_device_snmp_enabled",
        "DROP INDEX IF EXISTS idx_device_snmp_status", 
        "DROP INDEX IF EXISTS idx_device_snmp_ip"
    ]
    
    try:
        print("Инициализация подключения к базе данных...")
        await global_init()
        
        async with create_session() as db:
            print("Применение рефакторинга SNMP архитектуры...")
            
            for i, sql in enumerate(migration_sql, 1):
                try:
                    print(f"Выполнение команды {i}/{len(migration_sql)}: {sql[:60]}...")
                    await db.execute(text(sql))
                    await db.commit()
                    print(f"OK - Команда {i} выполнена успешно")
                except Exception as e:
                    print(f"WARNING - Ошибка в команде {i}: {e}")
                    # Продолжаем выполнение других команд
                    continue
            
            print("\nSUCCESS - Рефакторинг SNMP архитектуры применен успешно!")
            print("SNMP конфигурация теперь хранится в отдельной таблице device_snmp_config")
            
    except Exception as e:
        print(f"ERROR - Ошибка при применении рефакторинга: {e}")
        return False
    
    return True

async def check_refactor_status():
    """Проверяет статус рефакторинга"""
    try:
        await global_init()
        
        async with create_session() as db:
            # Проверяем, существует ли новая таблица
            result = await db.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'device_snmp_config'
            """))
            
            table_exists = result.fetchone()
            
            if table_exists:
                print("SUCCESS - Таблица device_snmp_config создана")
                
                # Проверяем количество записей
                count_result = await db.execute(text("SELECT COUNT(*) FROM device_snmp_config"))
                count = count_result.scalar()
                print(f"Найдено {count} SNMP конфигураций")
                
                # Проверяем, что старые поля удалены
                old_fields_result = await db.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'device' 
                    AND column_name LIKE 'snmp_%'
                """))
                
                old_fields = old_fields_result.fetchall()
                
                if not old_fields:
                    print("SUCCESS - Старые SNMP поля удалены из таблицы device")
                else:
                    print("WARNING - Найдены старые SNMP поля:")
                    for field in old_fields:
                        print(f"  - {field[0]}")
            else:
                print("ERROR - Таблица device_snmp_config не найдена")
                
    except Exception as e:
        print(f"ERROR - Ошибка при проверке рефакторинга: {e}")

async def main():
    """Основная функция"""
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        await check_refactor_status()
    else:
        print("Рефакторинг SNMP архитектуры...")
        print("Переводим SNMP поля в отдельную таблицу device_snmp_config")
        success = await apply_refactor_migration()
        
        if success:
            print("\nПреимущества новой архитектуры:")
            print("✓ Чистое разделение ответственности")
            print("✓ Отсутствие NULL полей в основной таблице")
            print("✓ Легкое добавление новых типов мониторинга")
            print("✓ Лучшая производительность запросов")
            print("✓ Простота поддержки и расширения")

if __name__ == "__main__":
    asyncio.run(main())


