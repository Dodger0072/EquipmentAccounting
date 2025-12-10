"""
Полиморфная архитектура для различных типов мониторинга
Позволяет легко добавлять новые типы мониторинга
"""
from sqlalchemy import Integer, String, Column, ForeignKey, JSON, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from models.db_session import Base
from datetime import datetime
from abc import ABC, abstractmethod

class MonitoringProvider(Base):
    """Базовый класс для провайдеров мониторинга"""
    __tablename__ = 'monitoring_providers'
    
    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey('device.id'), nullable=False)
    provider_type = Column(String(50), nullable=False)  # snmp, ping, http, ssh, custom
    enabled = Column(Boolean, default=False)
    
    # Конфигурация провайдера
    config = Column(JSON)
    
    # Результаты мониторинга
    last_check = Column(DateTime)
    status = Column(String(20), default='unknown')
    response_time = Column(Float)
    error_message = Column(Text)
    
    # Связь с устройством
    device = relationship("device", back_populates="monitoring_providers")
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'provider_type': self.provider_type,
            'enabled': self.enabled,
            'config': self.config,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'status': self.status,
            'response_time': self.response_time,
            'error_message': self.error_message
        }

# Конкретные провайдеры мониторинга
class SNMPProvider(MonitoringProvider):
    """SNMP провайдер мониторинга"""
    __tablename__ = 'snmp_providers'
    
    id = Column(Integer, ForeignKey('monitoring_providers.id'), primary_key=True)
    
    # SNMP специфичные поля
    ip_address = Column(String(45), nullable=False)
    port = Column(Integer, default=161)
    community = Column(String(255), default='public')
    version = Column(String(10), default='2c')
    
    # SNMPv3
    username = Column(String(255))
    password = Column(String(255))
    auth_protocol = Column(String(10), default='MD5')
    priv_protocol = Column(String(10), default='DES')
    
    def get_config(self):
        """Возвращает SNMP конфигурацию"""
        return {
            'ip_address': self.ip_address,
            'port': self.port,
            'community': self.community,
            'version': self.version,
            'username': self.username,
            'password': self.password,
            'auth_protocol': self.auth_protocol,
            'priv_protocol': self.priv_protocol
        }

class PingProvider(MonitoringProvider):
    """Ping провайдер мониторинга"""
    __tablename__ = 'ping_providers'
    
    id = Column(Integer, ForeignKey('monitoring_providers.id'), primary_key=True)
    target_ip = Column(String(45), nullable=False)
    timeout = Column(Integer, default=5)
    packet_size = Column(Integer, default=32)
    
    def get_config(self):
        return {
            'target_ip': self.target_ip,
            'timeout': self.timeout,
            'packet_size': self.packet_size
        }

class HTTPProvider(MonitoringProvider):
    """HTTP провайдер мониторинга"""
    __tablename__ = 'http_providers'
    
    id = Column(Integer, ForeignKey('monitoring_providers.id'), primary_key=True)
    url = Column(String(500), nullable=False)
    method = Column(String(10), default='GET')
    expected_status = Column(Integer, default=200)
    timeout = Column(Integer, default=10)
    
    def get_config(self):
        return {
            'url': self.url,
            'method': self.method,
            'expected_status': self.expected_status,
            'timeout': self.timeout
        }


