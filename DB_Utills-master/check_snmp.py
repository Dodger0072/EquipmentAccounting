#!/usr/bin/env python3
"""
Проверка SNMP подключения к устройству
"""
import sys
from pysnmp.hlapi import *

def check_snmp(ip, community='public', port=161, version='2c'):
    """Проверяет SNMP подключение"""
    print(f"Проверка SNMP на {ip}:{port}")
    print(f"Community: {community}, Version: {version}")
    print("-" * 50)
    
    # Определяем версию SNMP
    if version == '1':
        snmp_version = 0
    elif version == '2c':
        snmp_version = 1
    elif version == '3':
        snmp_version = 3
    else:
        snmp_version = 1
    
    # OID для получения системной информации
    test_oids = [
        ('1.3.6.1.2.1.1.1.0', 'System Description'),
        ('1.3.6.1.2.1.1.3.0', 'System Uptime'),
        ('1.3.6.1.2.1.1.5.0', 'System Name'),
    ]
    
    success_count = 0
    
    for oid, description in test_oids:
        try:
            print(f"Проверка {description} ({oid})...", end=' ')
            
            for (errorIndication, errorStatus, errorIndex, varBinds) in getCmd(
                SnmpEngine(),
                CommunityData(community, mpModel=snmp_version),
                UdpTransportTarget((ip, port), timeout=5, retries=2),
                ContextData(),
                ObjectType(ObjectIdentity(oid))
            ):
                if errorIndication:
                    print(f"ERROR: {errorIndication}")
                elif errorStatus:
                    print(f"ERROR: {errorStatus.prettyPrint()}")
                else:
                    for varBind in varBinds:
                        value = str(varBind[1])
                        if len(value) > 60:
                            value = value[:60] + "..."
                        print(f"OK: {value}")
                        success_count += 1
                        
        except Exception as e:
            print(f"ERROR: {str(e)}")
    
    print("-" * 50)
    if success_count > 0:
        print(f"SUCCESS - SNMP работает! Получено {success_count} ответов")
        return True
    else:
        print("FAILED - SNMP не отвечает")
        return False

def main():
    if len(sys.argv) < 2:
        print("Использование: python check_snmp.py <IP> [community] [port] [version]")
        print("\nПримеры:")
        print("  python check_snmp.py 192.168.0.100")
        print("  python check_snmp.py 192.168.0.100 public 161 2c")
        sys.exit(1)
    
    ip = sys.argv[1]
    community = sys.argv[2] if len(sys.argv) > 2 else 'public'
    port = int(sys.argv[3]) if len(sys.argv) > 3 else 161
    version = sys.argv[4] if len(sys.argv) > 4 else '2c'
    
    try:
        result = check_snmp(ip, community, port, version)
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\nПрервано пользователем")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR - Ошибка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
