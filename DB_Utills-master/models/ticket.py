from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, select, delete, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship

from models.db_session import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True)
    device_id = Column(Integer, ForeignKey("device.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("web_users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="open", nullable=False)
    created_at = Column(DateTime, default=func.now())
    closed_at = Column(DateTime, nullable=True)

    author = relationship("WebUser", lazy="selectin")
    device = relationship("device", lazy="selectin")

    @classmethod
    async def get_all(cls, session: AsyncSession) -> Sequence["Ticket"]:
        result = await session.execute(select(cls).order_by(cls.created_at.desc()))
        return result.scalars().all()

    @classmethod
    async def get_by_id(cls, session: AsyncSession, ticket_id: int) -> Optional["Ticket"]:
        result = await session.execute(select(cls).where(cls.id == ticket_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_by_author(cls, session: AsyncSession, author_id: int) -> Sequence["Ticket"]:
        result = await session.execute(
            select(cls).where(cls.author_id == author_id).order_by(cls.created_at.desc())
        )
        return result.scalars().all()

    @classmethod
    async def create(cls, session: AsyncSession, **kwargs) -> "Ticket":
        ticket = cls(**kwargs)
        session.add(ticket)
        await session.commit()
        await session.refresh(ticket)
        return ticket

    @classmethod
    async def update_status(cls, session: AsyncSession, ticket_id: int, status: str,
                            closed_at: Optional[datetime] = None) -> Optional["Ticket"]:
        values: dict = {"status": status}
        if closed_at is not None:
            values["closed_at"] = closed_at
        await session.execute(update(cls).where(cls.id == ticket_id).values(**values))
        await session.commit()
        return await cls.get_by_id(session, ticket_id)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "device_id": self.device_id,
            "device_name": self.device.name if self.device else None,
            "device_place": self.device.place_id if self.device else None,
            "author_id": self.author_id,
            "author_name": self.author.full_name if self.author else None,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,
        }
