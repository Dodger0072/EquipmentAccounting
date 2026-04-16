"""
Network Discovery Service — сканирование подсети через ping + SNMP.
Ping находит все живые хосты, SNMP собирает детальную информацию.
"""
import asyncio
import ipaddress
import time
import re
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

# Попытка импорта pysnmp — если не установлен, работаем только через ping
try:
    from pysnmp.hlapi.asyncio import (
        get_cmd, SnmpEngine, CommunityData,
        UdpTransportTarget, ContextData,
        ObjectType, ObjectIdentity,
    )
    _SNMP_AVAILABLE = True
except ImportError:
    _SNMP_AVAILABLE = False

SYSTEM_OIDS = {
    'sysDescr':    '1.3.6.1.2.1.1.1.0',
    'sysUpTime':   '1.3.6.1.2.1.1.3.0',
    'sysContact':  '1.3.6.1.2.1.1.4.0',
    'sysName':     '1.3.6.1.2.1.1.5.0',
    'sysLocation': '1.3.6.1.2.1.1.6.0',
    'sysServices': '1.3.6.1.2.1.1.7.0',
}

_MANUFACTURER_PATTERNS: List[tuple[str, str]] = [
    (r'\bcisco\b', 'Cisco'),
    (r'\bjuniper\b', 'Juniper'),
    (r'\bhuawei\b', 'Huawei'),
    (r'\bmikrotik\b', 'MikroTik'),
    (r'\bhp\b|hewlett.packard|\bhpe\b', 'HP'),
    (r'\bdell\b', 'Dell'),
    (r'\blenovo\b', 'Lenovo'),
    (r'\baruba\b', 'Aruba'),
    (r'\bfortinet\b|fortigate', 'Fortinet'),
    (r'\bzyxel\b', 'Zyxel'),
    (r'\bd-?link\b', 'D-Link'),
    (r'\btp-?link\b', 'TP-Link'),
    (r'\bnetgear\b', 'Netgear'),
    (r'\bcanon\b', 'Canon'),
    (r'\bepson\b', 'Epson'),
    (r'\bbrother\b', 'Brother'),
    (r'\bxerox\b', 'Xerox'),
    (r'\bricoh\b', 'Ricoh'),
    (r'\bkyocera\b', 'Kyocera'),
    (r'\bsamsung\b', 'Samsung'),
    (r'\bwindows\b', 'Microsoft'),
    (r'\blinux\b', 'Linux'),
    (r'\bfreebsd\b', 'FreeBSD'),
    (r'\bubiquiti\b|unifi|edgeswitch', 'Ubiquiti'),
    (r'\bqnap\b', 'QNAP'),
    (r'\bsynology\b', 'Synology'),
    (r'\bapc\b|smart-?ups', 'APC'),
]

_DEVICE_TYPE_PATTERNS: List[tuple[str, str]] = [
    (r'router|маршрутизатор', 'Router'),
    (r'switch|коммутатор', 'Switch'),
    (r'access.point|wireless|wi-?fi', 'Access Point'),
    (r'printer|принтер|laserjet|imagerunner|mfp', 'Printer'),
    (r'firewall|fortigate|asa', 'Firewall'),
    (r'ups|smart-?ups|источник бесп', 'UPS'),
    (r'nas|storage|diskstation', 'NAS'),
    (r'windows.*server|linux.*server|freebsd', 'Server'),
    (r'windows', 'Computer'),
    (r'linux', 'Computer'),
    (r'camera|видеокамера|ipcam', 'Camera'),
    (r'phone|телефон|voip', 'Phone'),
]


@dataclass
class DiscoveredDevice:
    ip: str
    mac: str
    name: str
    description: str
    manufacturer_guess: str
    device_type_guess: str
    uptime: str
    location: str
    contact: str
    community: str
    snmp_version: str
    response_time_ms: float
    has_snmp: bool = False


def _guess_manufacturer(sys_descr: str) -> str:
    lower = sys_descr.lower()
    for pattern, name in _MANUFACTURER_PATTERNS:
        if re.search(pattern, lower):
            return name
    return ''


def _guess_device_type(sys_descr: str) -> str:
    lower = sys_descr.lower()
    for pattern, dtype in _DEVICE_TYPE_PATTERNS:
        if re.search(pattern, lower):
            return dtype
    return ''


def _format_uptime(ticks_str: str) -> str:
    try:
        ticks = int(ticks_str)
    except (ValueError, TypeError):
        return ticks_str or ''
    total_seconds = ticks // 100
    days, remainder = divmod(total_seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, seconds = divmod(remainder, 60)
    parts = []
    if days:
        parts.append(f"{days}d")
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{seconds}s")
    return ' '.join(parts)


def _get_local_address(subnet_str: str) -> tuple[str, str]:
    """Return (local_ip, local_mac) for the interface matching the given subnet."""
    import socket
    import uuid
    try:
        network = ipaddress.IPv4Network(subnet_str, strict=False)
    except ValueError:
        return ('', '')

    # Determine local IP by connecting to a host in the subnet (no actual traffic)
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0)
        s.connect((str(next(network.hosts())), 1))
        local_ip = s.getsockname()[0]
        s.close()
    except Exception:
        try:
            local_ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            return ('', '')

    if ipaddress.IPv4Address(local_ip) not in network:
        return ('', '')

    # Get local MAC via getmac or uuid fallback
    local_mac = ''
    try:
        import subprocess
        out = subprocess.check_output(
            ['getmac', '/FO', 'CSV', '/NH', '/V'],
            timeout=5,
        ).decode(errors='ignore')
        for line in out.splitlines():
            if local_ip in line:
                parts = line.split(',')
                if len(parts) >= 2:
                    raw = parts[1].strip().strip('"').lower().replace('-', ':')
                    if len(raw) == 17:
                        local_mac = raw
                        break
    except Exception:
        pass
    if not local_mac:
        raw = '{:012x}'.format(uuid.getnode())
        local_mac = ':'.join(raw[i:i+2] for i in range(0, 12, 2))

    return (local_ip, local_mac)


def _parse_arp_table(subnet_str: str) -> Dict[str, str]:
    """
    Run 'arp -a' and return {ip: mac} for addresses in the given subnet.
    Works on Windows and Linux. Instant, no admin rights needed.
    """
    import subprocess
    try:
        network = ipaddress.IPv4Network(subnet_str, strict=False)
    except ValueError:
        return {}

    result: Dict[str, str] = {}
    try:
        output = subprocess.check_output(['arp', '-a'], timeout=5).decode(errors='ignore')
    except Exception:
        return {}

    for line in output.splitlines():
        match = re.search(
            r'(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+'
            r'([0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-]'
            r'[0-9a-fA-F]{2}[:-][0-9a-fA-F]{2}[:-][0-9a-fA-F]{2})',
            line,
        )
        if not match:
            continue
        ip_str, mac = match.group(1), match.group(2).lower().replace('-', ':')
        if mac == 'ff:ff:ff:ff:ff:ff':
            continue
        try:
            if ipaddress.IPv4Address(ip_str) in network:
                result[ip_str] = mac
        except ValueError:
            continue
    return result


# Well-known MAC OUI prefixes for manufacturer guessing when SNMP unavailable
_MAC_OUI_VENDORS: List[tuple[str, str]] = [
    ('b0:95:75', 'TP-Link'), ('50:c7:bf', 'TP-Link'), ('ec:41:18', 'TP-Link'),
    ('fc:3c:d7', 'Xiaomi'), ('78:11:dc', 'Xiaomi'), ('64:cc:2e', 'Xiaomi'),
    ('90:de:80', 'Samsung'), ('8c:f5:a3', 'Samsung'), ('bc:72:b1', 'Samsung'),
    ('dc:97:58', 'Huawei'), ('48:46:fb', 'Huawei'), ('00:e0:fc', 'Huawei'),
    ('a4:83:e7', 'Apple'), ('3c:06:30', 'Apple'), ('f0:18:98', 'Apple'),
    ('d8:bb:c1', 'Apple'), ('ac:bc:32', 'Apple'), ('38:f9:d3', 'Apple'),
    ('00:50:56', 'VMware'), ('00:0c:29', 'VMware'),
    ('b8:27:eb', 'Raspberry Pi'), ('dc:a6:32', 'Raspberry Pi'),
    ('7e:ca:82', 'Android'), ('6e:a1:a1', 'Android'),
]


def _guess_vendor_from_mac(mac: str) -> str:
    prefix = mac[:8]
    for oui, vendor in _MAC_OUI_VENDORS:
        if prefix == oui:
            return vendor
    return ''


async def _try_resolve_hostname(ip: str) -> str:
    """Try reverse DNS lookup."""
    import socket
    loop = asyncio.get_event_loop()
    try:
        result = await asyncio.wait_for(
            loop.run_in_executor(None, socket.gethostbyaddr, ip),
            timeout=1.0,
        )
        hostname = result[0]
        if hostname and hostname != ip:
            return hostname
    except Exception:
        pass
    return ''


class NetworkDiscoveryService:
    """Scans a subnet: ping to find live hosts, then SNMP for details."""

    def __init__(self, timeout: float = 1.0, retries: int = 0, concurrency: int = 50):
        self.timeout = timeout
        self.retries = retries
        self.concurrency = concurrency

    async def _snmp_get(
        self, engine, ip: str, port: int, community: str, oid: str,
    ) -> Optional[str]:
        if not _SNMP_AVAILABLE:
            return None
        try:
            transport = await UdpTransportTarget.create(
                (ip, port), timeout=self.timeout, retries=self.retries,
            )
            error_indication, error_status, _error_index, var_binds = await get_cmd(
                engine,
                CommunityData(community, mpModel=1),
                transport,
                ContextData(),
                ObjectType(ObjectIdentity(oid)),
            )
            if error_indication or error_status:
                return None
            for var_bind in var_binds:
                val = str(var_bind[1])
                if val and val != 'No Such Object currently exists at this OID':
                    return val
            return None
        except Exception:
            return None

    async def _snmp_probe(
        self, engine, ip: str, port: int, communities: List[str],
    ) -> Optional[dict]:
        """Try SNMP on a host. Returns dict with info or None."""
        if not _SNMP_AVAILABLE:
            return None

        for community in communities:
            sys_descr = await self._snmp_get(
                engine, ip, port, community, SYSTEM_OIDS['sysDescr'],
            )
            if sys_descr is None:
                continue

            oid_keys = ['sysName', 'sysUpTime', 'sysLocation', 'sysContact']
            tasks = [
                self._snmp_get(engine, ip, port, community, SYSTEM_OIDS[k])
                for k in oid_keys
            ]
            values = await asyncio.gather(*tasks)
            info = dict(zip(oid_keys, values))
            info['sysDescr'] = sys_descr
            info['community'] = community
            return info
        return None

    async def _enrich_host(
        self, engine, ip: str, mac: str, port: int,
        communities: List[str], semaphore: asyncio.Semaphore,
    ) -> DiscoveredDevice:
        """For a known-alive host (from ARP), try SNMP + DNS."""
        async with semaphore:
            snmp_info = await self._snmp_probe(engine, ip, port, communities)
            hostname = await _try_resolve_hostname(ip)

            if snmp_info:
                descr = snmp_info.get('sysDescr', '')
                return DiscoveredDevice(
                    ip=ip,
                    mac=mac,
                    name=snmp_info.get('sysName') or hostname,
                    description=descr,
                    manufacturer_guess=_guess_manufacturer(descr),
                    device_type_guess=_guess_device_type(descr),
                    uptime=_format_uptime(snmp_info.get('sysUpTime') or ''),
                    location=snmp_info.get('sysLocation') or '',
                    contact=snmp_info.get('sysContact') or '',
                    community=snmp_info.get('community', ''),
                    snmp_version='2c',
                    response_time_ms=0,
                    has_snmp=True,
                )
            else:
                mac_vendor = _guess_vendor_from_mac(mac)
                return DiscoveredDevice(
                    ip=ip,
                    mac=mac,
                    name=hostname,
                    description='',
                    manufacturer_guess=mac_vendor,
                    device_type_guess='',
                    uptime='',
                    location='',
                    contact='',
                    community='',
                    snmp_version='',
                    response_time_ms=0,
                    has_snmp=False,
                )

    async def discover(
        self,
        subnet: str,
        communities: Optional[List[str]] = None,
        port: int = 161,
    ) -> Dict[str, Any]:
        if communities is None:
            communities = ['public']

        try:
            network = ipaddress.IPv4Network(subnet, strict=False)
        except ValueError as exc:
            raise ValueError(f"Invalid subnet: {exc}")

        start_time = time.time()

        # 1) ARP table — instant list of all live hosts on the local network
        arp_hosts = await asyncio.get_event_loop().run_in_executor(
            None, _parse_arp_table, subnet,
        )

        # Also include the local machine (it won't be in its own ARP table)
        local_ip, local_mac = _get_local_address(subnet)
        if local_ip and local_ip not in arp_hosts:
            arp_hosts[local_ip] = local_mac

        if not arp_hosts:
            return {
                'discovered': [],
                'total_scanned': len(list(network.hosts())),
                'total_found': 0,
                'scan_time': round(time.time() - start_time, 2),
            }

        # 2) For each ARP host, try SNMP + reverse DNS in parallel
        engine = SnmpEngine() if _SNMP_AVAILABLE else None
        semaphore = asyncio.Semaphore(self.concurrency)

        tasks = [
            self._enrich_host(engine, ip, mac, port, communities, semaphore)
            for ip, mac in arp_hosts.items()
        ]
        results = await asyncio.gather(*tasks)

        discovered = [asdict(d) for d in results]
        discovered.sort(key=lambda d: tuple(int(p) for p in d['ip'].split('.')))
        scan_time = round(time.time() - start_time, 2)

        return {
            'discovered': discovered,
            'total_scanned': len(list(network.hosts())),
            'total_found': len(discovered),
            'scan_time': scan_time,
        }
