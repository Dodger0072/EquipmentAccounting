import asyncio
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession
from models.device import device
from models.place import place
from models.db_session import global_init, session_db


async def main():
    await global_init()
#     await test()
# @session_db
# async def test(session: AsyncSession):
#     user = User(telegram_id=15, username="Kolya", first_name="Kolya", age=11, city="Moskva", count_tests=23)
#     await user.save(session=session)
#     use = await User.get_user(telegram_id=15, session=session)
#     user_name = use.username
#     print(user_name)

    await test()

@session_db
async def test(session: AsyncSession):
    test_device = device(
        name="Komputer",
        category="Test Category",
        place_id=1,
        version="1.0",
        releaseDate=datetime.now().date(),
        softwareStartDate=datetime.now().date(),
        softwareEndDate=datetime.now().date(),
        manufacturer="Test Manufacturer",
        xCord=0.0,
        yCoord=0.0,
        waveRadius=1.0
    )
    test_device1 = device(
        name="Test Device1",
        category="Test Category1",
        place_id=2,
        version="2.0",
        releaseDate=datetime.now().date(),
        softwareStartDate=datetime.now().date(),
        softwareEndDate=datetime.now().date(),
        manufacturer="Test Manufacturer1",
        xCord=2.0,
        yCoord=2.0,
        waveRadius=2.0
    )
    test_place = place(name="Test Place1")

    # Сначала сохраните место, чтобы у него был id
    await test_place.save(session=session)

    # Затем присвойте id места устройству
    test_device.place_id = test_place.id
    test_device1.place_id = test_place.id
    # Сохраните устройство
    await test_device.save(session=session)
    await test_device1.save(session=session)
    # Подтвердите изменения
    await session.commit()

    print("Test completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
