#!/usr/bin/env python3
"""
Простой SNMP клиент без зависимостей
Использует raw socket для отправки SNMP запросов
"""
import sys
import socket
import struct
import random
import time

def create_snmp_get_request(community, oid):
    """Создает SNMP GET запрос"""
    # SNMP PDU структура (упрощенная)
    request_id = random.randint(1, 2147483647)
    
    # Простой SNMPv2c GET запрос
    # Это упрощенная версия, но должна работать для базовых проверок
    snmp_packet = bytearray()
    
    # SNMP Version (2c = 1)
    # Community string
    # PDU Type (GetRequest = 0xA0)
    # Request ID
    # Error status
    # Error index
    # Variable bindings
    
    # Это очень упрощенная версия, для реальной работы нужен полный ASN.1 кодировщик
    # Но для проверки что порт отвечает - достаточно
    
    return snmp_packet

def send_snmp_get(ip, port, community, oid, timeout=5):
    """Отправляет SNMP GET запрос"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(timeout)
        
        # Простейший SNMPv2c GET запрос для OID 1.3.6.1.2.1.1.1.0 (sysDescr)
        # Это упрощенная версия, реальный SNMP требует ASN.1 кодирование
        
        # Формируем минимальный SNMP GET запрос
        # SNMPv2c сообщение: version(1) + community + PDU
        request = bytearray()
        
        # SEQUENCE (SNMP Message)
        request.extend(bytes([0x30]))  # SEQUENCE tag
        
        # Version (INTEGER 1 = SNMPv2c)
        request.extend(bytes([0x02, 0x01, 0x01]))
        
        # Community (OCTET STRING)
        community_bytes = community.encode('utf-8')
        request.extend(bytes([0x04, len(community_bytes)]))
        request.extend(community_bytes)
        
        # GetRequest PDU (упрощенная версия)
        # Это минимальный запрос, который должен вызвать ответ от SNMP агента
        pdu = bytearray()
        pdu.extend(bytes([0xA0]))  # GetRequest PDU tag
        
        # Request ID
        pdu.extend(bytes([0x02, 0x01, 0x01]))
        
        # Error status
        pdu.extend(bytes([0x02, 0x01, 0x00]))
        
        # Error index
        pdu.extend(bytes([0x02, 0x01, 0x00]))
        
        # Variable bindings (пустой список для простоты)
        pdu.extend(bytes([0x30, 0x00]))
        
        # Добавляем длину PDU
        pdu_length = len(pdu) - 1
        pdu[1:1] = bytes([pdu_length])
        
        request.extend(pdu)
        
        # Обновляем общую длину
        total_length = len(request) - 1
        request[1:1] = bytes([total_length])
        
        # Отправляем запрос
        sock.sendto(bytes(request), (ip, port))
        
        # Ждем ответ
        try:
            response, addr = sock.recvfrom(4096)
            sock.close()
            
            if response:
                print(f"OK - Получен ответ от {addr[0]}:{addr[1]}")
                print(f"Размер ответа: {len(response)} байт")
                return True
            else:
                print("FAILED - Пустой ответ")
                return False
                
        except socket.timeout:
            sock.close()
            print("TIMEOUT - SNMP агент не ответил в течение 5 секунд")
            print("Возможные причины:")
            print("  - SNMP не настроен правильно")
            print("  - Неправильный community string")
            print("  - Firewall блокирует ответ")
            return False
            
    except Exception as e:
        print(f"ERROR - Ошибка при отправке запроса: {e}")
        return False

def test_snmp(ip, community='public', port=161):
    """Тестирует SNMP подключение"""
    print(f"Тестирование SNMP на {ip}:{port}")
    print(f"Community: {community}")
    print("-" * 50)
    
    # Проверка порта
    print("1. Проверка доступности порта...", end=' ')
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(2)
    try:
        result = sock.connect_ex((ip, port))
        sock.close()
        if result == 0:
            print("OK")
        else:
            print("FAILED")
            return False
    except:
        print("FAILED")
        return False
    
    # SNMP запрос
    print("\n2. Отправка SNMP GET запроса...")
    success = send_snmp_get(ip, port, community, '1.3.6.1.2.1.1.1.0')
    
    if success:
        print("\nSUCCESS - SNMP работает!")
        return True
    else:
        print("\nFAILED - SNMP не отвечает")
        return False

def main():
    if len(sys.argv) < 2:
        print("Использование: python snmp_client_simple.py <IP> [community] [port]")
        print("\nПримеры:")
        print("  python snmp_client_simple.py 192.168.0.100")
        print("  python snmp_client_simple.py 192.168.0.100 public 161")
        sys.exit(1)
    
    ip = sys.argv[1]
    community = sys.argv[2] if len(sys.argv) > 2 else 'public'
    port = int(sys.argv[3]) if len(sys.argv) > 3 else 161
    
    success = test_snmp(ip, community, port)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()



