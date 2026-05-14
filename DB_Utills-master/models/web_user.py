from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import Column, Integer, String, Boolean, DateTime, select, delete, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from models.db_session import Base


class WebUser(Base):
    __tablename__ = "web_users"

    id = Column(Integer, primary_key=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now())

    @classmethod
    async def get_by_username(cls, session: AsyncSession, username: str) -> Optional["WebUser"]:
        result = await session.execute(select(cls).where(cls.username == username))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_id(cls, session: AsyncSession, user_id: int) -> Optional["WebUser"]:
        result = await session.execute(select(cls).where(cls.id == user_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_all(cls, session: AsyncSession) -> Sequence["WebUser"]:
        result = await session.execute(select(cls).order_by(cls.id))
        return result.scalars().all()

    @classmethod
    async def create(cls, session: AsyncSession, **kwargs) -> "WebUser":
        user = cls(**kwargs)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    @classmethod
    async def update_user(cls, session: AsyncSession, user_id: int, data: dict) -> Optional["WebUser"]:
        await session.execute(update(cls).where(cls.id == user_id).values(**data))
        await session.commit()
        return await cls.get_by_id(session, user_id)

    @classmethod
    async def delete_user(cls, session: AsyncSession, user_id: int) -> bool:
        result = await session.execute(delete(cls).where(cls.id == user_id))
        await session.commit()
        return result.rowcount > 0

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
