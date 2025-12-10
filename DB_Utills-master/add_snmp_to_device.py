#!/usr/bin/env python3
"""
Добавление SNMP конфигурации к существующему устройству
"""
import sys
import requests
import json

BASE_URL = "http://localhost:8000"

def add_snmp_to_device(device_id, ip_address, community='public', port=161, version='2c'):
    """Добавляет SNMP конфигурацию к существующему устройству"""
    
    print(f"Добавление SNMP к устройству ID: {device_id}")
    print(f"IP: {ip_address}, Port: {port}, Community: {community}")
    print("-" * 50)
    
    try:
        # 1. Настраиваем SNMP (проверка устройства будет при добавлении SNMP)
        print("1. Настройка SNMP конфигурации...")
        snmp_data = {
            "device_id": device_id,
            "enabled": True,
            "ip_address": ip_address,
            "port": port,
            "community": community,
            "version": version
        }
        
        snmp_response = requests.post(f"{BASE_URL}/snmp/config", json=snmp_data)
        
        if snmp_response.status_code != 200:
            print(f"ERROR - Не удалось настроить SNMP: {snmp_response.status_code}")
            print(f"Ответ: {snmp_response.text}")
            return False
        
        print("OK - SNMP конфигурация добавлена")
        snmp_result = snmp_response.json()
        if 'config' in snmp_result:
            print(f"Конфигурация: {json.dumps(snmp_result['config'], indent=2, ensure_ascii=False)}")
        
        # 2. Проверяем SNMP
        print(f"\n2. Проверка SNMP подключения...")
        check_response = requests.get(f"{BASE_URL}/snmp/check/{device_id}")
        
        if check_response.status_code == 200:
            check_result = check_response.json()
            status = check_result.get('status', 'unknown')
            message = check_result.get('message', '')
            response_time = check_result.get('response_time')
            
            print(f"Статус: {status}")
            print(f"Сообщение: {message}")
            if response_time:
                print(f"Время отклика: {response_time}ms")
            
            if status == 'up':
                print("\nSUCCESS - SNMP мониторинг работает!")
            elif status == 'disabled':
                print("\nINFO - SNMP настроен, но отключен")
            else:
                print(f"\nWARNING - SNMP статус: {status}")
        else:
            print(f"WARNING - Не удалось проверить SNMP: {check_response.status_code}")
            print(f"Ответ: {check_response.text}")
        
        print(f"\nГотово! SNMP настроен для устройства ID: {device_id}")
        print(f"\nДля проверки используйте:")
        print(f"  curl http://localhost:8000/snmp/check/{device_id}")
        
        return True
        
    except requests.exceptions.ConnectionError:
        print(f"ERROR - Не удалось подключиться к серверу {BASE_URL}")
        print("Убедитесь, что бэкенд запущен: python Backend.py")
        return False
    except Exception as e:
        print(f"ERROR - Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

def list_devices():
    """Показывает список всех устройств"""
    try:
        response = requests.get(f"{BASE_URL}/get_all_devices")
        if response.status_code == 200:
            devices = response.json()
            print("Доступные устройства:")
            print("-" * 50)
            for device in devices:
                print(f"ID: {device.get('id')} - {device.get('name')} ({device.get('category')})")
            return devices
        else:
            print(f"ERROR - Не удалось получить список устройств: {response.status_code}")
            return []
    except Exception as e:
        print(f"ERROR - Ошибка: {e}")
        return []

def main():
    if len(sys.argv) < 3:
        print("Использование: python add_snmp_to_device.py <device_id> <IP> [community] [port] [version]")
        print("\nПримеры:")
        print("  python add_snmp_to_device.py 1 192.168.0.100")
        print("  python add_snmp_to_device.py 1 192.168.0.100 public 161 2c")
        print("\nИли через curl:")
        print("  curl -X POST http://localhost:8000/snmp/config \\")
        print("       -H \"Content-Type: application/json\" \\")
        print("       -d '{\"device_id\":1,\"enabled\":true,\"ip_address\":\"192.168.0.100\",\"port\":161,\"community\":\"public\",\"version\":\"2c\"}'")
        print("\nДля просмотра списка устройств:")
        print("  python add_snmp_to_device.py --list")
        sys.exit(1)
    
    if sys.argv[1] == '--list':
        list_devices()
        sys.exit(0)
    
    device_id = int(sys.argv[1])
    ip_address = sys.argv[2]
    community = sys.argv[3] if len(sys.argv) > 3 else 'public'
    port = int(sys.argv[4]) if len(sys.argv) > 4 else 161
    version = sys.argv[5] if len(sys.argv) > 5 else '2c'
    
    success = add_snmp_to_device(device_id, ip_address, community, port, version)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

