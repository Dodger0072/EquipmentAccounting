#!/usr/bin/env python3
"""
Скрипт для автоматического SNMP мониторинга устройств
Можно запускать по расписанию (cron) для периодической проверки
"""
import asyncio
import sys
import os
import logging
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession

# Добавляем путь к модулям проекта
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models.db_session import create_session, global_init
from models.device import device
from services.snmp_service import SNMPService

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('snmp_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SNMPMonitor:
    """Класс для автоматического мониторинга SNMP устройств"""
    
    def __init__(self):
        self.snmp_service = SNMPService()
    
    async def run_monitoring_cycle(self):
        """Выполняет один цикл мониторинга всех устройств"""
        logger.info("Starting SNMP monitoring cycle")
        
        try:
            # Инициализируем подключение к БД
            await global_init()
            
            # Создаем сессию БД
            async with create_session() as db:
                # Получаем все устройства с включенным SNMP
                devices = await device.get_all_devices(db)
                snmp_devices = [d for d in devices if d.snmp_enabled == 'true']
                
                if not snmp_devices:
                    logger.info("No devices with SNMP monitoring enabled")
                    return
                
                logger.info(f"Found {len(snmp_devices)} devices with SNMP enabled")
                
                # Преобразуем в конфигурации для SNMP сервиса
                device_configs = [d.to_dict() for d in snmp_devices]
                
                # Выполняем массовую проверку
                results = await self.snmp_service.bulk_check_devices(device_configs)
                
                # Обновляем статусы в базе данных
                updated_count = 0
                for device_id, result in results.items():
                    try:
                        if result['status'] in ['up', 'down']:
                            await device.update_device(db, device_id, {
                                'snmp_status': result['status'],
                                'snmp_response_time': result.get('response_time'),
                                'last_snmp_check': datetime.now()
                            })
                            updated_count += 1
                            logger.info(f"Device {device_id}: {result['status']} (response time: {result.get('response_time', 'N/A')}ms)")
                        else:
                            logger.warning(f"Device {device_id}: {result['status']} - {result.get('message', 'Unknown error')}")
                    except Exception as e:
                        logger.error(f"Failed to update device {device_id}: {e}")
                
                logger.info(f"Monitoring cycle completed. Updated {updated_count} devices")
                
                # Логируем сводку
                up_count = len([r for r in results.values() if r['status'] == 'up'])
                down_count = len([r for r in results.values() if r['status'] == 'down'])
                error_count = len([r for r in results.values() if r['status'] == 'error'])
                
                logger.info(f"Summary: {up_count} up, {down_count} down, {error_count} errors")
                
        except Exception as e:
            logger.error(f"Monitoring cycle failed: {e}")
            raise
    
    async def check_single_device(self, device_id: int):
        """Проверяет конкретное устройство"""
        try:
            await global_init()
            
            async with create_session() as db:
                device_obj = await device.get_device_by_id(db, device_id)
                if not device_obj:
                    logger.error(f"Device {device_id} not found")
                    return
                
                if device_obj.snmp_enabled != 'true':
                    logger.warning(f"SNMP monitoring not enabled for device {device_id}")
                    return
                
                device_config = device_obj.to_dict()
                result = await self.snmp_service.check_device_status(device_config)
                
                logger.info(f"Device {device_id} check result: {result}")
                
                # Обновляем статус в БД
                if result['status'] in ['up', 'down']:
                    await device.update_device(db, device_id, {
                        'snmp_status': result['status'],
                        'snmp_response_time': result.get('response_time'),
                        'last_snmp_check': datetime.now()
                    })
                
        except Exception as e:
            logger.error(f"Failed to check device {device_id}: {e}")

async def main():
    """Основная функция"""
    monitor = SNMPMonitor()
    
    # Проверяем аргументы командной строки
    if len(sys.argv) > 1:
        if sys.argv[1] == '--device' and len(sys.argv) > 2:
            # Проверяем конкретное устройство
            device_id = int(sys.argv[2])
            await monitor.check_single_device(device_id)
        else:
            print("Usage: python snmp_monitor.py [--device <device_id>]")
            sys.exit(1)
    else:
        # Выполняем полный цикл мониторинга
        await monitor.run_monitoring_cycle()

if __name__ == "__main__":
    asyncio.run(main())


