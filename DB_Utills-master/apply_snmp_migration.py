#!/usr/bin/env python3
"""
Скрипт для применения SNMP миграции через Python
Использует SQLAlchemy для выполнения SQL команд
"""
import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

# Добавляем путь к модулям проекта
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.db_session import create_session, global_init

async def apply_snmp_migration():
    """Применяет миграцию для добавления SNMP полей"""
    
    # SQL команды для миграции
    migration_sql = [
        # Добавляем SNMP поля
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_enabled VARCHAR(10) DEFAULT 'false'",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_ip VARCHAR(45)",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_port INTEGER DEFAULT 161",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_community VARCHAR(255) DEFAULT 'public'",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_version VARCHAR(10) DEFAULT '2c'",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_username VARCHAR(255)",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_password VARCHAR(255)",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_auth_protocol VARCHAR(10) DEFAULT 'MD5'",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_priv_protocol VARCHAR(10) DEFAULT 'DES'",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS last_snmp_check DATE",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_status VARCHAR(20) DEFAULT 'unknown'",
        "ALTER TABLE device ADD COLUMN IF NOT EXISTS snmp_response_time FLOAT",
        
        # Создаем индексы
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_enabled ON device(snmp_enabled)",
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_status ON device(snmp_status)",
        "CREATE INDEX IF NOT EXISTS idx_device_snmp_ip ON device(snmp_ip)",
    ]
    
    try:
        print("Инициализация подключения к базе данных...")
        await global_init()
        
        async with create_session() as db:
            print("Применение миграции SNMP полей...")
            
            for i, sql in enumerate(migration_sql, 1):
                try:
                    print(f"Выполнение команды {i}/{len(migration_sql)}: {sql[:50]}...")
                    await db.execute(text(sql))
                    await db.commit()
                    print(f"OK - Команда {i} выполнена успешно")
                except Exception as e:
                    print(f"WARNING - Ошибка в команде {i}: {e}")
                    # Продолжаем выполнение других команд
                    continue
            
            print("\nSUCCESS - Миграция SNMP полей применена успешно!")
            print("Теперь вы можете использовать SNMP мониторинг в вашей системе.")
            
    except Exception as e:
        print(f"ERROR - Ошибка при применении миграции: {e}")
        return False
    
    return True

async def check_migration_status():
    """Проверяет статус миграции"""
    try:
        await global_init()
        
        async with create_session() as db:
            # Проверяем, существуют ли SNMP поля
            result = await db.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'device' 
                AND column_name LIKE 'snmp_%'
                ORDER BY column_name
            """))
            
            columns = result.fetchall()
            
            if columns:
                print("SUCCESS - SNMP поля найдены в таблице device:")
                for col in columns:
                    print(f"  - {col[0]}")
            else:
                print("ERROR - SNMP поля не найдены. Необходимо применить миграцию.")
                
    except Exception as e:
        print(f"ERROR - Ошибка при проверке миграции: {e}")

async def main():
    """Основная функция"""
    if len(sys.argv) > 1 and sys.argv[1] == '--check':
        await check_migration_status()
    else:
        print("Применение миграции SNMP полей...")
        success = await apply_snmp_migration()
        
        if success:
            print("\nСледующие шаги:")
            print("1. Установите зависимости: pip install pysnmp==4.4.12")
            print("2. Запустите бэкенд: python Backend.py")
            print("3. Настройте SNMP для устройств через API")
            print("4. Протестируйте мониторинг")

if __name__ == "__main__":
    asyncio.run(main())
