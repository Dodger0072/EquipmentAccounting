from sqlalchemy import BigInteger, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column
from typing import Self, Optional, Sequence

from models.db_session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    telegram_id: Mapped[int] = mapped_column(BigInteger, unique=True)
    username: Mapped[Optional[str]] = mapped_column(default=None)
    first_name: Mapped[str]
    age: Mapped[int]
    city: Mapped[str]
    count_tests: Mapped[int] = mapped_column(default=0)

    @classmethod
    async def get_user(cls, telegram_id: int, session: AsyncSession) -> Self:
        """
        Get user by telegram id
        :param telegram_id: telegram id of user
        :param session: database session
        :return: User
        """

        _ = await session.execute(select(cls).where(cls.telegram_id == telegram_id))
        return _.scalar()

    @classmethod
    async def update_count_tests(cls, telegram_id: int, session: AsyncSession):
        """
        Update count tests
        :param telegram_id: user telegram id
        :param session: database session
        """
        await session.execute(update(cls).where(cls.telegram_id == telegram_id).values(count_tests=cls.count_tests + 1))

    @classmethod
    async def get_all_user_ids(cls, session: AsyncSession) -> Sequence[int]:
        """
        Get all telegram ids

        :param session: database session
        :return: sequence of user telegram ids
        """
        _ = await session.execute(select(cls.telegram_id))
        return _.scalars().all()

    @classmethod
    async def get_rating_by_telegram_id(cls, city: str, telegram_id: int, session: AsyncSession) -> int:
        """
        Get rating by telegram id
        :param city:
        :param telegram_id: user telegram id
        :param session: database session
        :return: rating
        """
        _ = await session.execute(select(cls).where(cls.city == city).order_by(cls.count_tests.desc()))
        for index, user in enumerate(_.scalars().all()):
            if user.telegram_id == telegram_id:
                return index + 1

    @classmethod
    async def get_rating_by_city(cls, city: str, session: AsyncSession) -> dict:
        """
        Get rating by city
        :param city: city
        :param session: database session
        :return: sequence of user names
        """
        _ = await session.execute(select(cls).where(cls.city == city).order_by(cls.count_tests.desc()))
        dct = {}
        for us in _.scalars().all():
            dct[us.first_name] = us.count_tests
        return dct

    async def save(self, session: AsyncSession):
        session.add(self)
        await session.commit()
