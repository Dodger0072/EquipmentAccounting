import asyncio
from models.db_session import global_init, create_session
from models.category import category

async def init_database():
    """Инициализация базы данных с созданием таблицы category"""
    await global_init()
    print("База данных инициализирована")
    print("Таблица category создана")

if __name__ == "__main__":
    asyncio.run(init_database())
