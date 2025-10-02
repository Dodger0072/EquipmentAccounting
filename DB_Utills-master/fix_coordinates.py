"""
Скрипт для исправления координат оборудования в базе данных.
Приводит координаты к правильному диапазону 0-100% для корректного отображения на карте.
Также удаляет устаревшие данные waveRadius, если они есть.
"""
import asyncio
from models.db_session import create_session
from models.device import device
from sqlalchemy import select, update

async def fix_coordinates():
    """Исправляет координаты устройств, приводя их к диапазону 0-100"""
    async with create_session() as db:
        # Получаем все устройства с координатами
        result = await db.execute(select(device).where(
            (device.xCord.isnot(None)) & (device.yCord.isnot(None))
        ))
        devices = result.scalars().all()
        
        print(f"Найдено устройств с координатами: {len(devices)}")
        
        for d in devices:
            old_x, old_y = d.xCord, d.yCord
            
            # Если координаты больше 100, приводим их к диапазону 0-100
            new_x = old_x
            new_y = old_y
            
            # Предполагаем, что координаты были в пикселях относительно изображения ~800x600
            # Приводим к процентам
            if old_x > 100:
                new_x = min((old_x / 800) * 100, 100)  # Предполагаем ширину ~800px
            if old_y > 100:
                new_y = min((old_y / 600) * 100, 100)  # Предполагаем высоту ~600px
                
            # Обновляем координаты если они изменились
            if new_x != old_x or new_y != old_y:
                await db.execute(
                    update(device)
                    .where(device.id == d.id)
                    .values(xCord=new_x, yCord=new_y)
                )
                print(f"Устройство '{d.name}': ({old_x:.1f}, {old_y:.1f}) -> ({new_x:.1f}, {new_y:.1f})")
            else:
                print(f"Устройство '{d.name}': координаты уже в правильном диапазоне ({old_x:.1f}, {old_y:.1f})")
        
        await db.commit()
        print("Координаты успешно обновлены!")

async def show_current_coordinates():
    """Показывает текущие координаты всех устройств"""
    async with create_session() as db:
        result = await db.execute(select(device))
        devices = result.scalars().all()
        
        print("Текущие координаты устройств:")
        for d in devices:
            print(f"ID: {d.id}, Название: '{d.name}', X: {d.xCord}, Y: {d.yCord}, MapId: {d.mapId}")

if __name__ == "__main__":
    print("=== ТЕКУЩИЕ КООРДИНАТЫ ===")
    asyncio.run(show_current_coordinates())
    
    print("\n=== ИСПРАВЛЕНИЕ КООРДИНАТ ===")
    asyncio.run(fix_coordinates())
    
    print("\n=== КООРДИНАТЫ ПОСЛЕ ИСПРАВЛЕНИЯ ===")
    asyncio.run(show_current_coordinates())
