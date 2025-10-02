from sqlalchemy import Integer, String, Column, Text, ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Sequence
from sqlalchemy import select, delete, update
from sqlalchemy.orm import relationship
from models.db_session import Base


class manufacturer(Base):
    __tablename__ = 'manufacturer'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey('category.id'), nullable=False)
    
    # Связь с категорией
    category = relationship("category", back_populates="manufacturers", lazy="select")

    @classmethod
    async def insert_manufacturer(cls, session: AsyncSession, manufacturer_data: dict) -> 'manufacturer':
        """Insert a new manufacturer into the database."""
        new_manufacturer = cls(**manufacturer_data)
        session.add(new_manufacturer)
        await session.commit()
        await session.refresh(new_manufacturer)
        return new_manufacturer

    @classmethod
    async def get_manufacturer_by_id(cls, session: AsyncSession, manufacturer_id: int) -> Optional['manufacturer']:
        """Get manufacturer by ID."""
        from sqlalchemy.orm import selectinload
        result = await session.execute(select(cls).where(cls.id == manufacturer_id).options(selectinload(cls.category)))
        return result.scalar_one_or_none()

    @classmethod
    async def get_manufacturer_by_name(cls, session: AsyncSession, name: str) -> Optional['manufacturer']:
        """Get manufacturer by name."""
        result = await session.execute(select(cls).where(cls.name == name))
        return result.scalar_one_or_none()

    @classmethod
    async def get_all_manufacturers(cls, session: AsyncSession) -> Sequence['manufacturer']:
        """Get all manufacturers."""
        from sqlalchemy.orm import selectinload
        result = await session.execute(select(cls).options(selectinload(cls.category)))
        return result.scalars().all()

    @classmethod
    async def get_manufacturers_by_category(cls, session: AsyncSession, category_id: int) -> Sequence['manufacturer']:
        """Get manufacturers by category."""
        from sqlalchemy.orm import selectinload
        result = await session.execute(select(cls).where(cls.category_id == category_id).options(selectinload(cls.category)))
        return result.scalars().all()

    @classmethod
    async def update_manufacturer(cls, session: AsyncSession, manufacturer_id: int, update_data: dict) -> Optional['manufacturer']:
        """Update manufacturer information."""
        await session.execute(update(cls).where(cls.id == manufacturer_id).values(**update_data))
        await session.commit()
        return await cls.get_manufacturer_by_id(session, manufacturer_id)

    @classmethod
    async def delete_manufacturer(cls, session: AsyncSession, manufacturer_id: int) -> bool:
        """Delete a manufacturer from the database."""
        result = await session.execute(delete(cls).where(cls.id == manufacturer_id))
        await session.commit()
        return result.rowcount > 0

    def to_dict(self) -> dict:
        """Convert manufacturer to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None
        }
