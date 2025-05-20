from typing import Optional, List, Sequence
from sqlalchemy import Column, Integer, String, update, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.ext.declarative import declarative_base
from models.db_session import Base


class place(Base):
    __tablename__ = 'places'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(index=True, unique=True)
    # Другие поля места, если есть

    # answers: Mapped[list["Answer"]] = relationship(lazy="selectin")
    @classmethod
    async def insert_place(cls, session: AsyncSession, place_data: dict) -> 'place':
        new_place = cls(**place_data)
        session.add(new_place)
        await session.commit()
        return new_place

    @classmethod
    async def get_place_by_id(cls, session: AsyncSession, place_id: int) -> Optional['place']:
        _ = await session.execute(select(cls).where(cls.id == place_id))
        return _.scalar()
    @classmethod
    async def update_place(cls, session: AsyncSession, place_id: int, update_data: dict) -> Optional['place']:
        """
        Update place information.
        :param session: database session
        :param place_id: ID of the place to update
        :param update_data: dictionary with update data
        :return: Place or None if not found
        """
        await session.execute(update(cls).where(cls.id == place_id).values(**update_data))
        await session.commit()
        return await cls.get_place_by_id(session, place_id)

    @classmethod
    async def delete_place(cls, session: AsyncSession, place_id: int) -> bool:
        """
        Delete a place from the database.
        :param session: database session
        :param place_id: ID of the place to delete
        :return: True if deletion was successful, False otherwise
        """
        result = await session.execute(delete(cls).where(cls.id == place_id))
        await session.commit()
        return result.rowcount > 0

    @classmethod
    async def get_place_by_id(cls, session: AsyncSession, place_id: int) -> Optional['place']:
        """
        Get a place by its ID.
        :param session: database session
        :param place_id: ID of the place to retrieve
        :return: Place or None if not found
        """
        _ = await session.execute(select(cls).where(cls.id == place_id))
        return _.scalar()

    @classmethod
    async def get_all_places(cls, session: AsyncSession) -> Sequence['place']:
        """
        Get all places.
        :param session: database session
        :return: Sequence of all places
        """
        _ = await session.execute(select(cls))
        return _.scalars().all()

    @classmethod
    async def get_places_by_name(cls, session: AsyncSession, name: str) -> Sequence['place']:
        """
        Get places by name.
        :param session: database session
        :param name: name to filter places by
        :return: Sequence of places with the specified name
        """
        _ = await session.execute(select(cls).where(cls.name == name))
        return _.scalars().all()
    async def save(self, session: AsyncSession):
        session.add(self)
        await session.commit()