import socket
import sys

def check_port(ip, port, timeout=2):
    """Проверяет доступность порта"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except Exception as e:
        print(f"Ошибка при проверке порта: {e}")
        return False

def check_snmp_basic(ip, port=161):
    """Проверяет базовую доступность SNMP"""
    print(f"Проверка SNMP на {ip}:{port}...")
    
    # Проверка ping
    import subprocess
    try:
        result = subprocess.run(['ping', '-n', '1', ip], 
                              capture_output=True, timeout=5)
        if result.returncode == 0:
            print(f"✓ Устройство {ip} доступно по сети")
        else:
            print(f"✗ Устройство {ip} недоступно по сети")
            return False
    except Exception as e:
        print(f"Ошибка ping: {e}")
    
    # Проверка порта
    print(f"Проверка порта {port}...")
    if check_port(ip, port):
        print(f"✓ Порт {port} открыт")
    else:
        print(f"✗ Порт {port} закрыт или недоступен")
        print("\nВозможные причины:")
        print("1. SNMP сервис не запущен на устройстве")
        print("2. Firewall блокирует порт 161")
        print("3. Устройство не поддерживает SNMP")
        return False
    
    return True

if __name__ == "__main__":
    ip = sys.argv[1] if len(sys.argv) > 1 else "192.168.0.100"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 161
    
    check_snmp_basic(ip, port)



