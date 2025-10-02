from functools import wraps
from os import environ
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import json


class Base:
    __allow_unmapped__ = True

    async def save(self, session: AsyncSession):
        session.add(self)
        await session.commit()


Base = declarative_base(cls=Base)

env = environ.get

__factory = None


def get_database_url(alembic: bool = False) -> str:
    schema = "postgresql+asyncpg"
    
    # Попробуем получить настройки из переменных окружения
    db_user = env('DB_USER')
    db_password = env('DB_PASSWORD')
    db_host = env('DB_HOST')
    db_port = env('DB_PORT')
    db_name = env('DB_NAME')
    
    # Если переменные окружения не заданы, используем JSON файл
    if not all([db_user, db_password, db_host, db_port, db_name]):
        file = open(".\\data\\config_db.json")
        data = json.load(file)
        file.close()
        
        db_user = data['db_login']
        db_password = data['db_password']
        db_host = data['db_host']
        db_port = data['db_port']
        db_name = data['db_name']

    if alembic:
        schema = "postgresql"
    return (f"{schema}://{db_user}:{db_password}@"
            f"{db_host}:{db_port}/{db_name}")


async def global_init():
    global __factory

    if __factory:
        return
    conn_str = get_database_url()

    print(conn_str)
    engine = create_async_engine(conn_str, pool_pre_ping=True)

    async with engine.begin() as conn:
        # await conn.run_sync(SqlAlchemyBase.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    __factory = async_sessionmaker(
        engine, expire_on_commit=False
    )
    from . import __all_models  # noqa


def create_session() -> AsyncSession:
    global __factory
    return __factory()  # noqa


def session_db(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        async with create_session() as session:
            return await func(*args, session=session, **kwargs)

    return wrapper
