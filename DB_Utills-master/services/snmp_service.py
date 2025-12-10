"""
SNMP Service для мониторинга сетевых устройств
"""
import asyncio
import time
from typing import Dict, Optional, Tuple, Any
from datetime import datetime
from pysnmp.hlapi.asyncio import get_cmd, SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity
from pysnmp.error import PySnmpError
import logging

logger = logging.getLogger(__name__)

class SNMPService:
    """Сервис для SNMP мониторинга устройств"""
    
    # Стандартные OID для получения информации о устройстве
    OIDS = {
        'system_description': '1.3.6.1.2.1.1.1.0',  # sysDescr
        'system_uptime': '1.3.6.1.2.1.1.3.0',       # sysUpTime
        'system_contact': '1.3.6.1.2.1.1.4.0',      # sysContact
        'system_name': '1.3.6.1.2.1.1.5.0',         # sysName
        'system_location': '1.3.6.1.2.1.1.6.0',     # sysLocation
        'system_services': '1.3.6.1.2.1.1.7.0',      # sysServices
        'interfaces_count': '1.3.6.1.2.1.2.1.0',    # ifNumber
        'interface_status': '1.3.6.1.2.1.2.2.1.8',  # ifOperStatus
        'interface_admin_status': '1.3.6.1.2.1.2.2.1.7',  # ifAdminStatus
    }
    
    def __init__(self):
        self.timeout = 5  # таймаут для SNMP запросов в секундах
        self.retries = 2  # количество попыток
    
    async def check_device_status(self, device_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Проверяет статус устройства через SNMP
        
        Args:
            device_config: Конфигурация устройства с SNMP параметрами
            
        Returns:
            Dict с результатами проверки
        """
        if not device_config.get('snmp_enabled') or device_config.get('snmp_enabled') != 'true':
            return {
                'status': 'disabled',
                'message': 'SNMP monitoring disabled for this device',
                'response_time': None,
                'timestamp': datetime.now().isoformat()
            }
        
        ip = device_config.get('snmp_ip')
        if not ip:
            return {
                'status': 'error',
                'message': 'SNMP IP address not configured',
                'response_time': None,
                'timestamp': datetime.now().isoformat()
            }
        
        start_time = time.time()
        
        try:
            # Получаем базовую информацию о системе
            system_info = await self._get_system_info(device_config)
            
            response_time = (time.time() - start_time) * 1000  # в миллисекундах
            
            return {
                'status': 'up',
                'message': 'Device is responding',
                'response_time': round(response_time, 2),
                'timestamp': datetime.now().isoformat(),
                'system_info': system_info
            }
            
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            logger.error(f"SNMP check failed for {ip}: {str(e)}")
            
            return {
                'status': 'down',
                'message': f'SNMP check failed: {str(e)}',
                'response_time': round(response_time, 2),
                'timestamp': datetime.now().isoformat()
            }
    
    async def _get_system_info(self, device_config: Dict[str, Any]) -> Dict[str, Any]:
        """Получает системную информацию через SNMP"""
        ip = device_config['snmp_ip']
        port = device_config.get('snmp_port', 161)
        community = device_config.get('snmp_community', 'public')
        version = device_config.get('snmp_version', '2c')
        
        system_info = {}
        errors = []
        
        # Получаем основные OID - достаточно получить хотя бы один для проверки доступности
        oids_to_check = [
            'system_description',  # Самый важный - если его нет, устройство не отвечает
        ]
        
        # Пробуем получить хотя бы один OID для проверки доступности
        for oid_name in oids_to_check:
            oid = self.OIDS[oid_name]
            try:
                value = await self._snmp_get(ip, port, community, version, oid)
                if value:
                    system_info[oid_name] = str(value)
                    # Если хотя бы один OID получен - устройство работает
                    return system_info
            except Exception as e:
                errors.append(str(e))
                logger.warning(f"Failed to get {oid_name} for {ip}:{port}: {e}")
        
        # Если не удалось получить ни один OID - выбрасываем исключение
        if not system_info:
            error_msg = f"SNMP request failed: {', '.join(errors) if errors else 'No response from device'}"
            raise Exception(error_msg)
        
        return system_info
    
    async def _snmp_get(self, ip: str, port: int, community: str, version: str, oid: str) -> Optional[str]:
        """Выполняет SNMP GET запрос"""
        try:
            # Определяем версию SNMP
            if version == '1':
                snmp_version = 0
            elif version == '2c':
                snmp_version = 1
            elif version == '3':
                snmp_version = 3
            else:
                snmp_version = 1  # по умолчанию 2c
            
            # Выполняем асинхронный SNMP запрос
            # В pysnmp 7.x нужно использовать await .create() для создания transport target
            transport = await UdpTransportTarget.create((ip, port), timeout=self.timeout, retries=self.retries)
            
            # В pysnmp 7.x get_cmd возвращает корутину, которую нужно await
            cmd_gen = get_cmd(
                SnmpEngine(),
                CommunityData(community, mpModel=snmp_version),
                transport,
                ContextData(),
                ObjectType(ObjectIdentity(oid))
            )
            
            # Получаем результат из корутины
            errorIndication, errorStatus, errorIndex, varBinds = await cmd_gen
            
            if errorIndication:
                # RequestTimedOut и другие ошибки
                error_msg = str(errorIndication)
                if 'timeout' in error_msg.lower() or 'timedout' in error_msg.lower():
                    raise Exception(f"SNMP timeout: No response from {ip}:{port}")
                raise Exception(f"SNMP error indication: {error_msg}")
            elif errorStatus:
                raise Exception(f"SNMP error status: {errorStatus.prettyPrint()}")
            else:
                for varBind in varBinds:
                    return str(varBind[1])
            
            return None
            
        except Exception as e:
            raise Exception(f"SNMP GET failed: {str(e)}")
    
    async def get_interface_status(self, device_config: Dict[str, Any]) -> Dict[str, Any]:
        """Получает статус интерфейсов устройства"""
        if not device_config.get('snmp_enabled') or device_config.get('snmp_enabled') != 'true':
            return {'interfaces': [], 'message': 'SNMP monitoring disabled'}
        
        ip = device_config['snmp_ip']
        port = device_config.get('snmp_port', 161)
        community = device_config.get('snmp_community', 'public')
        version = device_config.get('snmp_version', '2c')
        
        interfaces = []
        
        try:
            # Получаем количество интерфейсов
            if_count = await self._snmp_get(ip, port, community, version, self.OIDS['interfaces_count'])
            if not if_count:
                return {'interfaces': [], 'message': 'Could not get interface count'}
            
            interface_count = int(if_count)
            
            # Получаем статус каждого интерфейса
            for i in range(1, min(interface_count + 1, 11)):  # ограничиваем до 10 интерфейсов
                try:
                    oper_status_oid = f"{self.OIDS['interface_status']}.{i}"
                    admin_status_oid = f"{self.OIDS['interface_admin_status']}.{i}"
                    
                    oper_status = await self._snmp_get(ip, port, community, version, oper_status_oid)
                    admin_status = await self._snmp_get(ip, port, community, version, admin_status_oid)
                    
                    interfaces.append({
                        'interface_id': i,
                        'operational_status': self._get_status_name(oper_status),
                        'administrative_status': self._get_status_name(admin_status),
                        'is_up': oper_status == '1' and admin_status == '1'
                    })
                    
                except Exception as e:
                    logger.warning(f"Failed to get status for interface {i}: {e}")
                    continue
            
            return {
                'interfaces': interfaces,
                'total_interfaces': interface_count,
                'message': 'Interface status retrieved successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to get interface status for {ip}: {e}")
            return {
                'interfaces': [],
                'message': f'Failed to get interface status: {str(e)}'
            }
    
    def _get_status_name(self, status_code: str) -> str:
        """Преобразует код статуса в читаемое название"""
        status_map = {
            '1': 'up',
            '2': 'down', 
            '3': 'testing',
            '4': 'unknown',
            '5': 'dormant',
            '6': 'notPresent',
            '7': 'lowerLayerDown'
        }
        return status_map.get(status_code, 'unknown')
    
    async def bulk_check_devices(self, devices_configs: list) -> Dict[str, Any]:
        """Проверяет статус нескольких устройств параллельно"""
        tasks = []
        for device_config in devices_configs:
            if device_config.get('snmp_enabled') == 'true':
                task = self.check_device_status(device_config)
                tasks.append((device_config.get('id', 'unknown'), task))
        
        results = {}
        
        if tasks:
            # Выполняем все проверки параллельно
            task_results = await asyncio.gather(*[task for _, task in tasks], return_exceptions=True)
            
            for i, (device_id, _) in enumerate(tasks):
                result = task_results[i]
                if isinstance(result, Exception):
                    results[device_id] = {
                        'status': 'error',
                        'message': f'Check failed: {str(result)}',
                        'response_time': None,
                        'timestamp': datetime.now().isoformat()
                    }
                else:
                    results[device_id] = result
        
        return results


