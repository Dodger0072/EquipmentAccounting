from sqlalchemy import Integer, String, Column, Text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Sequence
from sqlalchemy import select, delete, update
from sqlalchemy.orm import relationship
from models.db_session import Base


class category(Base):
    __tablename__ = 'category'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True, default='default')
    
    # Связь с производителями
    manufacturers = relationship("manufacturer", back_populates="category")

    @classmethod
    async def insert_category(cls, session: AsyncSession, category_data: dict) -> 'category':
        """Insert a new category into the database."""
        new_category = cls(**category_data)
        session.add(new_category)
        await session.commit()
        await session.refresh(new_category)
        return new_category

    @classmethod
    async def get_category_by_id(cls, session: AsyncSession, category_id: int) -> Optional['category']:
        """Get category by ID."""
        result = await session.execute(select(cls).where(cls.id == category_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_category_by_name(cls, session: AsyncSession, name: str) -> Optional['category']:
        """Get category by name."""
        result = await session.execute(select(cls).where(cls.name == name))
        return result.scalar_one_or_none()

    @classmethod
    async def get_all_categories(cls, session: AsyncSession) -> Sequence['category']:
        """Get all categories."""
        result = await session.execute(select(cls))
        return result.scalars().all()

    @classmethod
    async def update_category(cls, session: AsyncSession, category_id: int, update_data: dict) -> Optional['category']:
        """Update category information."""
        await session.execute(update(cls).where(cls.id == category_id).values(**update_data))
        await session.commit()
        return await cls.get_category_by_id(session, category_id)

    @classmethod
    async def delete_category(cls, session: AsyncSession, category_id: int) -> bool:
        """Delete a category from the database."""
        result = await session.execute(delete(cls).where(cls.id == category_id))
        await session.commit()
        return result.rowcount > 0

    def to_dict(self) -> dict:
        """Convert category to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon
        }
