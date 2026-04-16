from typing import Optional, Sequence, List
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, update, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import relationship, Mapped, mapped_column
from models.db_session import Base


class classroom(Base):
    __tablename__ = 'classrooms'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    map_id: Mapped[int] = mapped_column(Integer, ForeignKey('places.id'), nullable=False)
    polygon_coordinates: Mapped[dict] = mapped_column(JSON, nullable=False)  # Массив точек [{x, y}, ...]
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    @classmethod
    async def insert_classroom(cls, session: AsyncSession, classroom_data: dict) -> 'classroom':
        """Insert a new classroom into the database."""
        new_classroom = cls(**classroom_data)
        session.add(new_classroom)
        await session.commit()
        await session.refresh(new_classroom)
        return new_classroom

    @classmethod
    async def get_classroom_by_id(cls, session: AsyncSession, classroom_id: int) -> Optional['classroom']:
        """Get classroom by ID."""
        result = await session.execute(select(cls).where(cls.id == classroom_id))
        return result.scalar_one_or_none()

    @classmethod
    async def get_all_classrooms(cls, session: AsyncSession) -> Sequence['classroom']:
        """Get all classrooms."""
        result = await session.execute(select(cls))
        return result.scalars().all()

    @classmethod
    async def get_classrooms_by_map(cls, session: AsyncSession, map_id: int) -> Sequence['classroom']:
        """Get all classrooms for a specific map."""
        result = await session.execute(select(cls).where(cls.map_id == map_id))
        return result.scalars().all()

    @classmethod
    async def get_classroom_by_name(cls, session: AsyncSession, name: str) -> Optional['classroom']:
        """Get classroom by name."""
        result = await session.execute(select(cls).where(cls.name == name))
        return result.scalar_one_or_none()

    @classmethod
    async def find_classroom_by_point(cls, session: AsyncSession, map_id: int, x: float, y: float) -> Optional['classroom']:
        """Find classroom that contains the given point (x, y in percentages 0-100)."""
        classrooms = await cls.get_classrooms_by_map(session, map_id)
        
        for classroom in classrooms:
            if cls._point_in_polygon(x, y, classroom.polygon_coordinates):
                return classroom
        
        return None

    @staticmethod
    def _point_in_polygon(x: float, y: float, polygon: List[dict]) -> bool:
        """
        Check if point (x, y) is inside polygon using ray casting algorithm.
        Polygon is a list of points: [{"x": float, "y": float}, ...]
        """
        if not polygon or len(polygon) < 3:
            return False
        
        n = len(polygon)
        inside = False
        
        p1x, p1y = polygon[0].get('x', 0), polygon[0].get('y', 0)
        
        for i in range(1, n + 1):
            p2x, p2y = polygon[i % n].get('x', 0), polygon[i % n].get('y', 0)
            
            if y > min(p1y, p2y):
                if y <= max(p1y, p2y):
                    if x <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or x <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
        
        return inside

    @classmethod
    async def update_classroom(cls, session: AsyncSession, classroom_id: int, update_data: dict) -> Optional['classroom']:
        """Update classroom information."""
        await session.execute(update(cls).where(cls.id == classroom_id).values(**update_data))
        await session.commit()
        return await cls.get_classroom_by_id(session, classroom_id)

    @classmethod
    async def delete_classroom(cls, session: AsyncSession, classroom_id: int) -> bool:
        """Delete a classroom from the database."""
        result = await session.execute(delete(cls).where(cls.id == classroom_id))
        await session.commit()
        return result.rowcount > 0

    @classmethod
    async def get_devices_by_classroom(cls, session: AsyncSession, classroom_name: str) -> Sequence:
        """Get all devices in a classroom."""
        from models.device import device as device_model
        result = await session.execute(select(device_model).where(device_model.place_id == classroom_name))
        devices = result.scalars().all()
        return list(devices)  # Преобразуем в список для избежания проблем с lazy loading

    def to_dict(self) -> dict:
        """Convert classroom to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "map_id": self.map_id,
            "polygon_coordinates": self.polygon_coordinates,
            "description": self.description
        }

