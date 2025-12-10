# Устранение проблем с SNMP

## Проблема: "No SNMP response received before timeout"

### Шаг 1: Проверьте, что SNMP сервис запущен на устройстве

На устройстве `192.168.0.100` (Windows):

1. Откройте **Службы** (services.msc)
2. Найдите **SNMP Service** и **SNMP Trap Service**
3. Убедитесь, что они **запущены** и **автоматически запускаются**

### Шаг 2: Настройте Community Strings

1. В **Службах** найдите **SNMP Service**
2. Правый клик → **Свойства** → вкладка **Безопасность**
3. Убедитесь, что в списке **Accepted community names** есть:
   - `public` (или другой community, который вы используете)
   - Права доступа: **READ ONLY** или **READ WRITE**

### Шаг 3: Настройте разрешенные хосты

1. В **Свойствах SNMP Service** → вкладка **Безопасность**
2. В разделе **Accept SNMP packets from these hosts** добавьте:
   - IP адрес вашего компьютера (откуда идет запрос)
   - Или оставьте пустым для разрешения всех хостов

### Шаг 4: Проверьте Firewall

На устройстве `192.168.0.100`:

1. Откройте **Брандмауэр Windows**
2. Убедитесь, что правило для **SNMP (UDP 161)** включено
3. Или временно отключите firewall для теста

### Шаг 5: Проверьте настройки SNMP через реестр (если нужно)

Если стандартные настройки не работают, можно проверить реестр:

```powershell
# Проверить community strings
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\ValidCommunities"

# Проверить разрешенные хосты
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\SNMP\Parameters\PermittedManagers"
```

### Шаг 6: Тестирование

После настройки попробуйте:

```bash
# С вашего компьютера
python test_snmp_direct.py 192.168.0.100 161 public 2c
```

### Альтернативные community strings для теста

Попробуйте разные community:
- `public` (по умолчанию)
- `private`
- `community`
- Пустая строка (если настроено)

### Проверка через snmpwalk (если установлен)

```bash
snmpwalk -v 2c -c public 192.168.0.100
```

## Быстрая проверка на устройстве

На устройстве `192.168.0.100` выполните:

```powershell
# Проверить, что SNMP слушает порт 161
netstat -an | findstr :161

# Должно показать что-то вроде:
# UDP    0.0.0.0:161            *:*
```

Если порт не слушается, SNMP сервис не запущен или не настроен.



