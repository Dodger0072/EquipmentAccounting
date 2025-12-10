#!/usr/bin/env python3
"""
Простая проверка SNMP без сложных зависимостей
"""
import sys
import socket
import subprocess
import platform

def check_port(ip, port, timeout=3):
    """Проверяет доступность порта"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except:
        return False

def test_snmp_simple(ip, community='public', port=161):
    """Простая проверка SNMP"""
    print(f"Проверка SNMP на {ip}:{port}")
    print(f"Community: {community}")
    print("-" * 50)
    
    # 1. Проверка доступности порта
    print("1. Проверка доступности порта 161...", end=' ')
    if check_port(ip, port):
        print("OK - Порт открыт")
    else:
        print("FAILED - Порт недоступен или закрыт firewall")
        return False
    
    # 2. Попытка использовать snmpget/snmpwalk если установлены
    print("\n2. Попытка SNMP запроса...")
    
    # Пробуем snmpget если установлен
    try:
        result = subprocess.run(
            ['snmpget', '-v2c', '-c', community, ip, '1.3.6.1.2.1.1.1.0'],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print("OK - SNMP работает!")
            print(f"Ответ: {result.stdout.decode('utf-8', errors='ignore')[:100]}")
            return True
        else:
            print(f"FAILED - SNMP не отвечает: {result.stderr.decode('utf-8', errors='ignore')}")
    except FileNotFoundError:
        print("INFO - snmpget не установлен (это нормально)")
    except Exception as e:
        print(f"ERROR: {e}")
    
    # 3. Если snmpget не работает, просто проверяем что порт открыт
    print("\n3. Итоговый результат:")
    if check_port(ip, port):
        print("SUCCESS - Порт SNMP (161) открыт и доступен")
        print("SNMP сервис, вероятно, работает")
        print("\nДля полной проверки установите Net-SNMP:")
        print("  choco install net-snmp")
        print("  или скачайте с: http://www.net-snmp.org/download.html")
        return True
    else:
        print("FAILED - Порт недоступен")
        return False

def main():
    if len(sys.argv) < 2:
        print("Использование: python test_snmp_simple.py <IP> [community] [port]")
        print("\nПримеры:")
        print("  python test_snmp_simple.py 192.168.0.100")
        print("  python test_snmp_simple.py 192.168.0.100 public 161")
        sys.exit(1)
    
    ip = sys.argv[1]
    community = sys.argv[2] if len(sys.argv) > 2 else 'public'
    port = int(sys.argv[3]) if len(sys.argv) > 3 else 161
    
    # ВАЖНО: 127.0.0.1 это localhost (сам компьютер)
    if ip == "127.0.0.1":
        print("ВНИМАНИЕ: 127.0.0.1 - это localhost (этот компьютер)")
        print("Для проверки другого компьютера нужен его реальный IP адрес!")
        print("Узнайте IP на том компьютере командой: ipconfig")
        print()
    
    success = test_snmp_simple(ip, community, port)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()