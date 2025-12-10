import asyncio
from pysnmp.hlapi.asyncio import get_cmd, SnmpEngine, CommunityData, UdpTransportTarget, ContextData, ObjectType, ObjectIdentity

async def test_snmp(ip, port, community='public', version='2c'):
    """Тестирует SNMP подключение"""
    print(f"Тестирование SNMP на {ip}:{port}")
    print(f"Community: {community}, Version: {version}")
    
    try:
        # Определяем версию SNMP
        if version == '1':
            snmp_version = 0
        elif version == '2c':
            snmp_version = 1
        else:
            snmp_version = 1
        
        # Создаем transport
        transport = await UdpTransportTarget.create((ip, port), timeout=5, retries=2)
        
        # Выполняем SNMP GET запрос для system description
        oid = '1.3.6.1.2.1.1.1.0'  # sysDescr
        
        print(f"\nОтправка SNMP GET запроса для OID {oid}...")
        errorIndication, errorStatus, errorIndex, varBinds = await get_cmd(
            SnmpEngine(),
            CommunityData(community, mpModel=snmp_version),
            transport,
            ContextData(),
            ObjectType(ObjectIdentity(oid))
        )
        
        if errorIndication:
            print(f"✗ Ошибка: {errorIndication}")
            if 'timeout' in str(errorIndication).lower():
                print("\nВозможные причины:")
                print("1. Неправильный community string (попробуйте 'public' или 'private')")
                print("2. SNMP сервис не настроен правильно на устройстве")
                print("3. Firewall блокирует SNMP трафик")
                print("4. Устройство не поддерживает SNMPv2c (попробуйте SNMPv1)")
            return False
        elif errorStatus:
            print(f"✗ SNMP ошибка: {errorStatus.prettyPrint()}")
            if errorIndex:
                print(f"   OID: {varBinds[int(errorIndex) - 1][0] if varBinds else '?'}")
            return False
        else:
            print("✓ SNMP запрос успешен!")
            for varBind in varBinds:
                print(f"   {varBind[0].prettyPrint()} = {varBind[1].prettyPrint()}")
            return True
            
    except Exception as e:
        print(f"✗ Исключение: {e}")
        return False

if __name__ == "__main__":
    import sys
    ip = sys.argv[1] if len(sys.argv) > 1 else "192.168.0.100"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 161
    community = sys.argv[3] if len(sys.argv) > 3 else "public"
    version = sys.argv[4] if len(sys.argv) > 4 else "2c"
    
    result = asyncio.run(test_snmp(ip, port, community, version))
    sys.exit(0 if result else 1)



