import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Sequence
from sqlalchemy import Integer, String, Date, Float, ForeignKey, update, select, delete
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base
from models.db_session import Base


class device(Base):
    __tablename__ = 'devices'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)
    place_id: Mapped[int] = mapped_column(ForeignKey("places.id"))  # Внешний ключ на таблицу мест
    version: Mapped[str] = mapped_column(String)
    releaseDate: Mapped[datetime.datetime] = mapped_column(default=datetime.datetime.now)
    softwareStartDate: Mapped[datetime.datetime] = mapped_column(default=datetime.datetime.now)
    softwareEndDate: Mapped[datetime.datetime] = mapped_column(default=datetime.datetime.now)
    manufacturer: Mapped[str] = mapped_column(String)
    xCord: Mapped[float] = mapped_column(Float)
    yCoord: Mapped[float] = mapped_column(Float)
    waveRadius: Mapped[float] = mapped_column(Float)

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
    async def get_device_by_id(cls, session: AsyncSession, device_id: int) -> Optional['device']:
        """
        Get a device by its ID.
        :param session: database session
        :param device_id: ID of the device to retrieve
        :return: Device or None if not found
        """
        _ = await session.execute(select(cls).where(cls.id == device_id))
        return _.scalar()

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
