"""
Альтернативная модель для мониторинга устройств
Использует JSON поле для гибкой конфигурации
"""
from sqlalchemy import Integer, String, Column, ForeignKey, JSON, DateTime, Boolean
from sqlalchemy.orm import relationship
from models.db_session import Base
from datetime import datetime
import json

class DeviceMonitoring(Base):
    """Мониторинг устройств с гибкой конфигурацией"""
    __tablename__ = 'device_monitoring'
    
    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey('device.id'), unique=True, nullable=False)
    
    # Тип мониторинга
    monitoring_type = Column(String(50), nullable=False)  # snmp, ping, http, custom
    
    # Конфигурация в JSON формате
    config = Column(JSON, nullable=False)
    
    # Статус мониторинга
    enabled = Column(Boolean, default=False)
    last_check = Column(DateTime)
    status = Column(String(20), default='unknown')
    response_time = Column(Float)
    
    # Связь с устройством
    device = relationship("device", back_populates="monitoring")
    
    def get_snmp_config(self):
        """Получает SNMP конфигурацию из JSON"""
        if self.monitoring_type == 'snmp':
            return self.config
        return None
    
    def set_snmp_config(self, snmp_config):
        """Устанавливает SNMP конфигурацию"""
        self.monitoring_type = 'snmp'
        self.config = snmp_config
    
    def to_dict(self):
        """Преобразует в словарь для API"""
        return {
            'id': self.id,
            'device_id': self.device_id,
            'monitoring_type': self.monitoring_type,
            'config': self.config,
            'enabled': self.enabled,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'status': self.status,
            'response_time': self.response_time
        }


