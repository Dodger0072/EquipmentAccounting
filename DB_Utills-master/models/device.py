import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Sequence
from sqlalchemy import Integer, String, Column, Float, ForeignKey, update, select, delete, Date
from sqlalchemy.orm import relationship, Mapped, mapped_column
from models.db_session import Base


class device(Base):
    __tablename__ = 'device'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    place_id = Column(String)  # Название комнаты/помещения
    version = Column(String)
    releaseDate = Column(Date)  # дата закупки
    softwareStartDate = Column(Date)  # дата устаревания
    softwareEndDate = Column(Date, nullable=True)  # дата снятия
    updateDate = Column(Date, nullable=True)  # дата обновления по
    manufacturer = Column(String)  # Оставляем для обратной совместимости
    xCord = Column(Float)
    yCord = Column(Float)
    mapId = Column(Integer)

    # answers: Mapped[list[Answer]] = relationship(lazy="selectin")

    @classmethod
    async def insert_device(cls, session: AsyncSession, device_data: dict) -> 'device':
        new_device = cls(**device_data)
        session.add(new_device)
        await session.commit()
        return new_device

    @classmethod
    async def get_device_by_id(cls, session: AsyncSession, device_id: int) -> Optional['device']:
        _ = await session.execute(select(cls).where(cls.id == device_id))
        return _.scalar()
    @classmethod
    async def update_device(cls, session: AsyncSession, device_id: int, update_data: dict) -> Optional['device']:
        """
        Update device information.
        :param session: database session
        :param device_id: ID of the device to update
        :param update_data: dictionary with update data
        :return: Device or None if not found
        """
        await session.execute(update(cls).where(cls.id == device_id).values(**update_data))
        await session.commit()
        return await cls.get_device_by_id(session, device_id)

    @classmethod
    async def delete_device(cls, session: AsyncSession, device_id: int) -> bool:
        """
        Delete a device from the database.
        :param session: database session
        :param device_id: ID of the device to delete
        :return: True if deletion was successful, False otherwise
        """
        result = await session.execute(delete(cls).where(cls.id == device_id))
        await session.commit()
        return result.rowcount > 0


    @classmethod
    async def get_all_devices(cls, session: AsyncSession) -> Sequence['device']:
        """
        Get all devices.
        :param session: database session
        :return: Sequence of all devices
        """
        _ = await session.execute(select(cls))
        return _.scalars().all()

    @classmethod
    async def get_devices_by_category(cls, session: AsyncSession, category: str) -> Sequence['device']:
        """
        Get devices by category.
        :param session: database session
        :param category: category to filter devices by
        :return: Sequence of devices in the specified category
        """
        _ = await session.execute(select(cls).where(cls.category == category))
        return _.scalars().all()

    async def save(self, session: AsyncSession):
        session.add(self)
        await session.commit()
