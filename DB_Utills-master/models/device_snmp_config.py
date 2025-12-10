"""
Модель для SNMP конфигурации устройств
Отдельная таблица для хранения SNMP настроек
"""
from sqlalchemy import Integer, String, Column, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from models.db_session import Base
from datetime import datetime

class DeviceSNMPConfig(Base):
    """Конфигурация SNMP для устройства"""
    __tablename__ = 'device_snmp_config'
    
    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey('device.id'), unique=True, nullable=False)
    
    # Основные SNMP настройки
    enabled = Column(Boolean, default=False, nullable=False)
    ip_address = Column(String(45), nullable=False)  # IPv4/IPv6
    port = Column(Integer, default=161, nullable=False)
    community = Column(String(255), default='public')
    version = Column(String(10), default='2c', nullable=False)  # 1, 2c, 3
    
    # SNMPv3 настройки (опциональные)
    username = Column(String(255))
    password = Column(String(255))
    auth_protocol = Column(String(10), default='MD5')  # MD5, SHA, SHA224, SHA256, SHA384, SHA512
    priv_protocol = Column(String(10), default='DES')  # DES, AES, AES192, AES256
    
    # Статус мониторинга
    last_check = Column(DateTime)
    status = Column(String(20), default='unknown')  # up, down, unknown, disabled
    response_time = Column(Float)  # в миллисекундах
    
    # Дополнительные настройки
    timeout = Column(Integer, default=5)  # таймаут в секундах
    retries = Column(Integer, default=2)
    check_interval = Column(Integer, default=300)  # интервал проверки в секундах
    
    # Связь с устройством
    device = relationship("device", back_populates="snmp_config")
    
    def to_dict(self):
        """Преобразует в словарь для API"""
        return {
            'id': self.id,
            'device_id': self.device_id,
            'enabled': self.enabled,
            'ip_address': self.ip_address,
            'port': self.port,
            'community': self.community,
            'version': self.version,
            'username': self.username,
            'password': self.password,
            'auth_protocol': self.auth_protocol,
            'priv_protocol': self.priv_protocol,
            'last_check': self.last_check.isoformat() if self.last_check else None,
            'status': self.status,
            'response_time': self.response_time,
            'timeout': self.timeout,
            'retries': self.retries,
            'check_interval': self.check_interval
        }
    
    @classmethod
    async def get_by_device_id(cls, session, device_id):
        """Получает SNMP конфигурацию по ID устройства"""
        from sqlalchemy import select
        result = await session.execute(
            select(cls).where(cls.device_id == device_id)
        )
        return result.scalar_one_or_none()
    
    @classmethod
    async def create_or_update(cls, session, device_id, config_data):
        """Создает или обновляет SNMP конфигурацию"""
        existing = await cls.get_by_device_id(session, device_id)
        
        if existing:
            # Обновляем существующую конфигурацию
            for key, value in config_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            await session.commit()
            return existing
        else:
            # Создаем новую конфигурацию
            config_data['device_id'] = device_id
            new_config = cls(**config_data)
            session.add(new_config)
            await session.commit()
            return new_config
    
    @classmethod
    async def get_all_enabled(cls, session):
        """Получает все включенные SNMP конфигурации"""
        from sqlalchemy import select
        result = await session.execute(
            select(cls).where(cls.enabled == True)
        )
        return result.scalars().all()


