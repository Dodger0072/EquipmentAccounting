#!/usr/bin/env python3
"""
Добавление устройства и настройка SNMP через API
"""
import sys
import requests
import json

BASE_URL = "http://localhost:8000"

def add_device_with_snmp(name, ip_address, category="Computer", place="Дом", manufacturer="Unknown", community="public", port=161):
    """Добавляет устройство и настраивает SNMP"""
    
    print(f"Добавление устройства: {name}")
    print(f"IP: {ip_address}, Category: {category}")
    print("-" * 50)
    
    try:
        # 1. Добавляем устройство
        print("1. Добавление устройства в систему...")
        from datetime import datetime, date
        today = date.today().isoformat()
        
        device_data = {
            "name": name,
            "category": category,
            "place_id": place,
            "manufacturer": manufacturer,
            "version": "1.0",  # обязательное поле
            "releaseDate": today,  # обязательное поле
            "softwareStartDate": today  # обязательное поле
        }
        
        response = requests.post(f"{BASE_URL}/add_device", json=device_data)
        
        if response.status_code != 200:
            print(f"ERROR - Не удалось добавить устройство: {response.status_code}")
            print(f"Ответ: {response.text}")
            return None
        
        device_result = response.json()
        device_id = device_result.get('id')
        
        if not device_id:
            # Попробуем получить из другого формата ответа
            if isinstance(device_result, dict) and 'id' in device_result:
                device_id = device_result['id']
            else:
                print(f"Ответ сервера: {device_result}")
                print("ERROR - Не удалось получить ID устройства")
                return None
        
        print(f"OK - Устройство добавлено с ID: {device_id}")
        
        # 2. Настраиваем SNMP
        print(f"\n2. Настройка SNMP конфигурации...")
        snmp_data = {
            "device_id": device_id,
            "enabled": True,
            "ip_address": ip_address,
            "port": port,
            "community": community,
            "version": "2c"
        }
        
        snmp_response = requests.post(f"{BASE_URL}/snmp/config", json=snmp_data)
        
        if snmp_response.status_code != 200:
            print(f"ERROR - Не удалось настроить SNMP: {snmp_response.status_code}")
            print(f"Ответ: {snmp_response.text}")
            return device_id
        
        print("OK - SNMP конфигурация добавлена")
        
        # 3. Проверяем SNMP
        print(f"\n3. Проверка SNMP подключения...")
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
            else:
                print(f"\nWARNING - SNMP статус: {status}")
        else:
            print(f"WARNING - Не удалось проверить SNMP: {check_response.status_code}")
            print(f"Ответ: {check_response.text}")
        
        print(f"\nУстройство успешно добавлено!")
        print(f"Device ID: {device_id}")
        print(f"IP: {ip_address}")
        print(f"\nДля проверки используйте:")
        print(f"  curl http://localhost:8000/snmp/check/{device_id}")
        print(f"  или")
        print(f"  python add_device_snmp.py \"{name}\" {ip_address}")
        
        return device_id
        
    except requests.exceptions.ConnectionError:
        print(f"ERROR - Не удалось подключиться к серверу {BASE_URL}")
        print("Убедитесь, что бэкенд запущен: python Backend.py")
        return None
    except Exception as e:
        print(f"ERROR - Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return None

def main():
    if len(sys.argv) < 3:
        print("Использование: python add_device_snmp.py <название> <IP> [category] [place] [community]")
        print("\nПримеры:")
        print("  python add_device_snmp.py \"Другой компьютер\" 192.168.0.100")
        print("  python add_device_snmp.py \"Роутер\" 192.168.0.1 Router Дом")
        print("  python add_device_snmp.py \"Принтер\" 192.168.0.50 Printer Офис public")
        print("\nИли через curl:")
        print("  1. curl -X POST http://localhost:8000/add_device -H \"Content-Type: application/json\" -d '{\"name\":\"Устройство\",\"category\":\"Computer\",\"place_id\":\"Дом\",\"manufacturer\":\"Unknown\",\"version\":\"1.0\",\"releaseDate\":\"2024-01-01\",\"softwareStartDate\":\"2024-01-01\"}'")
        print("  2. curl -X POST http://localhost:8000/snmp/config -H \"Content-Type: application/json\" -d '{\"device_id\":1,\"enabled\":true,\"ip_address\":\"192.168.0.100\",\"port\":161,\"community\":\"public\",\"version\":\"2c\"}'")
        print("  3. curl http://localhost:8000/snmp/check/1")
        sys.exit(1)
    
    name = sys.argv[1]
    ip_address = sys.argv[2]
    category = sys.argv[3] if len(sys.argv) > 3 else "Computer"
    place = sys.argv[4] if len(sys.argv) > 4 else "Дом"
    community = sys.argv[5] if len(sys.argv) > 5 else "public"
    
    device_id = add_device_with_snmp(name, ip_address, category, place, community=community)
    
    if device_id:
        print(f"\nГотово! Device ID: {device_id}")
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
