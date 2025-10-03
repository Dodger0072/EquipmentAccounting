from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from models.device import device
from models.place import place
from models.category import category
from models.manufacturer import manufacturer
from models.db_session import create_session, Base
from schemas import EquipmentCreate, EquipmentUpdate, CategoryCreate, CategoryUpdate, CategoryResponse, ManufacturerCreate, ManufacturerUpdate, ManufacturerResponse
from datetime import datetime
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio


# Инициализация базы данных при запуске
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from models.db_session import global_init
    await global_init()
    yield
    # Shutdown
    pass

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Обработчик для preflight запросов
@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

@app.post("/add_place")
async def add_place(place_data: dict):
    async with create_session() as db:
        existing = await db.execute(select(place).where(place.name == place_data["name"]))
        existing = existing.scalar_one_or_none()
        
        if existing:
            raise HTTPException(status_code=400, detail="Place with this name already exists")
        
        new_place = place(name=place_data["name"])
        db.add(new_place)
        await db.commit()
        await db.refresh(new_place)
        return {"message": "Place added successfully", "id": new_place.id}

@app.post("/add_device")
async def add_device(equipment: EquipmentCreate):
    async with create_session() as db:
        existing = await db.execute(select(device).where(device.name == equipment.name))
        existing = existing.scalar_one_or_none()
        
        if existing:
            raise HTTPException(status_code=400, detail="Device with this name already exists")
        
        # Преобразуем строки дат в объекты date
        equipment_dict = equipment.model_dump()
        equipment_dict["releaseDate"] = datetime.strptime(equipment_dict["releaseDate"], "%Y-%m-%d").date()
        equipment_dict["softwareStartDate"] = datetime.strptime(equipment_dict["softwareStartDate"], "%Y-%m-%d").date()
        
        # Обрабатываем опциональные даты
        if equipment_dict.get("softwareEndDate"):
            equipment_dict["softwareEndDate"] = datetime.strptime(equipment_dict["softwareEndDate"], "%Y-%m-%d").date()
        else:
            equipment_dict["softwareEndDate"] = None
            
        if equipment_dict.get("updateDate"):
            equipment_dict["updateDate"] = datetime.strptime(equipment_dict["updateDate"], "%Y-%m-%d").date()
        else:
            equipment_dict["updateDate"] = None
        
        # Обрабатываем числовые поля
        if equipment_dict.get("xCord") is not None and equipment_dict["xCord"] != "":
            equipment_dict["xCord"] = float(equipment_dict["xCord"])
        else:
            equipment_dict["xCord"] = None
            
        if equipment_dict.get("yCord") is not None and equipment_dict["yCord"] != "":
            equipment_dict["yCord"] = float(equipment_dict["yCord"])
        else:
            equipment_dict["yCord"] = None
            
        if equipment_dict.get("mapId") is not None and equipment_dict["mapId"] != "":
            equipment_dict["mapId"] = int(equipment_dict["mapId"])
        else:
            equipment_dict["mapId"] = None
        
        new_device = device(**equipment_dict)
        db.add(new_device)
        await db.commit()
        await db.refresh(new_device)
        return {"message": "Device added successfully", "id": new_device.id, "device": {
            "id": new_device.id,
            "name": new_device.name,
            "category": new_device.category,
            "xCord": new_device.xCord,
            "yCord": new_device.yCord,
            "place_id": new_device.place_id,
            "version": new_device.version,
            "releaseDate": new_device.releaseDate.isoformat() if new_device.releaseDate else None,
            "softwareStartDate": new_device.softwareStartDate.isoformat() if new_device.softwareStartDate else None,
            "softwareEndDate": new_device.softwareEndDate.isoformat() if new_device.softwareEndDate else None,
            "updateDate": new_device.updateDate.isoformat() if new_device.updateDate else None,
            "manufacturer": new_device.manufacturer,
            "mapId": new_device.mapId,
        }}

@app.get("/search")
async def search_devices():
    async with create_session() as db:
        result = await db.execute(select(device))
        devices = result.scalars().all()
        
        return {
            "devices": [
                {
                    "name": d.name, 
                    "category": d.category, 
                    "xCord": d.xCord, 
                    "yCord": d.yCord,
                    "id": d.id,
                    "place_id": d.place_id,
                    "version": d.version,
                    "releaseDate": d.releaseDate.isoformat() if d.releaseDate else None,
                    "softwareStartDate": d.softwareStartDate.isoformat() if d.softwareStartDate else None,
                    "softwareEndDate": d.softwareEndDate.isoformat() if d.softwareEndDate else None,
                    "updateDate": d.updateDate.isoformat() if d.updateDate else None,
                    "manufacturer": d.manufacturer,
                    "mapId": d.mapId,
                } 
                for d in devices
            ]
        }

@app.delete("/delete_device/{device_id}")
async def delete_device(device_id: int):
    async with create_session() as db:
        result = await db.execute(select(device).where(device.id == device_id))
        db_device = result.scalar_one_or_none()
        
        if not db_device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        await db.execute(delete(device).where(device.id == device_id))
        await db.commit()
        
        return {"message": f"Device {device_id} deleted successfully"}

@app.delete("/delete_devices_by_category/{category_id}")
async def delete_devices_by_category(category_id: int):
    """Удалить все устройства категории"""
    async with create_session() as db:
        # Получаем категорию
        category_result = await db.execute(select(category).where(category.id == category_id))
        category_obj = category_result.scalar_one_or_none()
        
        if not category_obj:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Получаем все устройства этой категории
        devices_result = await db.execute(select(device).where(device.category == category_obj.name))
        devices = devices_result.scalars().all()
        
        if not devices:
            raise HTTPException(status_code=404, detail="No devices found for this category")
        
        # Удаляем все устройства
        await db.execute(delete(device).where(device.category == category_obj.name))
        await db.commit()
        
        return {
            "message": f"All devices from category '{category_obj.name}' deleted successfully",
            "deleted_count": len(devices)
        }

@app.put("/update_device/{device_id}")
async def update_device(device_id: int, equipment: EquipmentUpdate):
    async with create_session() as db:
        result = await db.execute(select(device).where(device.id == device_id))
        db_device = result.scalar_one_or_none()
        
        if not db_device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Преобразуем данные для обновления
        update_data = equipment.model_dump(exclude_unset=True)
        
        # Обрабатываем даты, если они переданы
        if "releaseDate" in update_data and update_data["releaseDate"]:
            update_data["releaseDate"] = datetime.strptime(update_data["releaseDate"], "%Y-%m-%d").date()
        
        if "softwareStartDate" in update_data and update_data["softwareStartDate"]:
            update_data["softwareStartDate"] = datetime.strptime(update_data["softwareStartDate"], "%Y-%m-%d").date()
        
        if "softwareEndDate" in update_data and update_data["softwareEndDate"]:
            update_data["softwareEndDate"] = datetime.strptime(update_data["softwareEndDate"], "%Y-%m-%d").date()
        elif "softwareEndDate" in update_data and update_data["softwareEndDate"] is None:
            update_data["softwareEndDate"] = None
            
        if "updateDate" in update_data and update_data["updateDate"]:
            update_data["updateDate"] = datetime.strptime(update_data["updateDate"], "%Y-%m-%d").date()
        elif "updateDate" in update_data and update_data["updateDate"] is None:
            update_data["updateDate"] = None
        
        # Обрабатываем числовые поля
        if "xCord" in update_data and update_data["xCord"] is not None and update_data["xCord"] != "":
            update_data["xCord"] = float(update_data["xCord"])
        elif "xCord" in update_data and (update_data["xCord"] is None or update_data["xCord"] == ""):
            update_data["xCord"] = None
            
        if "yCord" in update_data and update_data["yCord"] is not None and update_data["yCord"] != "":
            update_data["yCord"] = float(update_data["yCord"])
        elif "yCord" in update_data and (update_data["yCord"] is None or update_data["yCord"] == ""):
            update_data["yCord"] = None
            
        if "mapId" in update_data and update_data["mapId"] is not None and update_data["mapId"] != "":
            update_data["mapId"] = int(update_data["mapId"])
        elif "mapId" in update_data and (update_data["mapId"] is None or update_data["mapId"] == ""):
            update_data["mapId"] = None
        
        # Выполняем обновление
        await db.execute(update(device).where(device.id == device_id).values(**update_data))
        await db.commit()
        
        # Получаем обновленное устройство
        result = await db.execute(select(device).where(device.id == device_id))
        updated_device = result.scalar_one()
        
        return {"message": "Device updated successfully", "device": {
            "id": updated_device.id,
            "name": updated_device.name,
            "category": updated_device.category,
            "xCord": updated_device.xCord,
            "yCord": updated_device.yCord,
            "place_id": updated_device.place_id,
            "version": updated_device.version,
            "releaseDate": updated_device.releaseDate.isoformat() if updated_device.releaseDate else None,
            "softwareStartDate": updated_device.softwareStartDate.isoformat() if updated_device.softwareStartDate else None,
            "softwareEndDate": updated_device.softwareEndDate.isoformat() if updated_device.softwareEndDate else None,
            "updateDate": updated_device.updateDate.isoformat() if updated_device.updateDate else None,
            "manufacturer": updated_device.manufacturer,
            "mapId": updated_device.mapId,
        }}


@app.post("/login")
def login(credentials: dict):
    if credentials.get("username") == "admin" and credentials.get("password") == "12345":
        return {"token": "my-secret-jwt"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# API endpoints для категорий
@app.get("/categories", tags=["Категории"])
async def get_categories():
    """Получить все категории"""
    async with create_session() as db:
        categories = await category.get_all_categories(db)
        return [cat.to_dict() for cat in categories]

@app.post("/categories", tags=["Категории"])
async def create_category(category_data: CategoryCreate):
    """Создать новую категорию"""
    async with create_session() as db:
        # Проверяем, существует ли категория с таким именем
        existing = await category.get_category_by_name(db, category_data.name)
        if existing:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
        
        new_category = await category.insert_category(db, category_data.model_dump())
        return new_category.to_dict()

@app.get("/categories/{category_id}", tags=["Категории"])
async def get_category(category_id: int):
    """Получить категорию по ID"""
    async with create_session() as db:
        cat = await category.get_category_by_id(db, category_id)
        if not cat:
            raise HTTPException(status_code=404, detail="Category not found")
        return cat.to_dict()

@app.put("/categories/{category_id}", tags=["Категории"])
async def update_category(category_id: int, category_data: CategoryUpdate):
    """Обновить категорию"""
    async with create_session() as db:
        # Проверяем, существует ли категория
        existing = await category.get_category_by_id(db, category_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Если обновляется имя, проверяем уникальность
        if category_data.name and category_data.name != existing.name:
            name_check = await category.get_category_by_name(db, category_data.name)
            if name_check:
                raise HTTPException(status_code=400, detail="Category with this name already exists")
        
        # Обновляем только переданные поля
        update_data = {k: v for k, v in category_data.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        updated_category = await category.update_category(db, category_id, update_data)
        return updated_category.to_dict()

@app.delete("/categories/{category_id}", tags=["Категории"])
async def delete_category(category_id: int):
    """Удалить категорию"""
    async with create_session() as db:
        # Проверяем, существует ли категория
        existing = await category.get_category_by_id(db, category_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Проверяем, есть ли связанные устройства
        related_devices = await device.get_devices_by_category(db, existing.name)
        if related_devices:
            # Преобразуем устройства в список словарей для JSON ответа
            devices_list = [device.to_dict() for device in related_devices]
            raise HTTPException(
                status_code=400, 
                detail={
                    "message": f"Нельзя удалить категорию '{existing.name}', так как к ней привязаны устройства",
                    "devices": devices_list
                }
            )
        
        # Удаляем всех производителей этой категории
        deleted_manufacturers = await manufacturer.delete_manufacturers_by_category(db, category_id)
        print(f"Deleted {deleted_manufacturers} manufacturers for category {category_id}")
        
        success = await category.delete_category(db, category_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete category")
        
        return {"message": f"Category {category_id} deleted successfully"}

# API endpoints для производителей
@app.get("/manufacturers", tags=["Производители"])
async def get_manufacturers():
    """Получить всех производителей"""
    async with create_session() as db:
        manufacturers = await manufacturer.get_all_manufacturers(db)
        return [man.to_dict() for man in manufacturers]

@app.get("/manufacturers/category/{category_id}", tags=["Производители"])
async def get_manufacturers_by_category(category_id: int):
    """Получить производителей по категории"""
    async with create_session() as db:
        # Проверяем, существует ли категория
        existing_category = await category.get_category_by_id(db, category_id)
        if not existing_category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        manufacturers = await manufacturer.get_manufacturers_by_category(db, category_id)
        return [man.to_dict() for man in manufacturers]

@app.post("/manufacturers", tags=["Производители"])
async def create_manufacturer(manufacturer_data: ManufacturerCreate):
    """Создать нового производителя"""
    async with create_session() as db:
        # Проверяем, существует ли категория
        existing_category = await category.get_category_by_id(db, manufacturer_data.category_id)
        if not existing_category:
            raise HTTPException(status_code=404, detail="Category not found")
        
        # Проверяем, существует ли производитель с таким именем
        existing = await manufacturer.get_manufacturer_by_name(db, manufacturer_data.name)
        if existing:
            raise HTTPException(status_code=400, detail="Manufacturer with this name already exists")
        
        new_manufacturer = await manufacturer.insert_manufacturer(db, manufacturer_data.model_dump())
        return new_manufacturer.to_dict()

@app.get("/manufacturers/{manufacturer_id}", tags=["Производители"])
async def get_manufacturer(manufacturer_id: int):
    """Получить производителя по ID"""
    async with create_session() as db:
        man = await manufacturer.get_manufacturer_by_id(db, manufacturer_id)
        if not man:
            raise HTTPException(status_code=404, detail="Manufacturer not found")
        return man.to_dict()

@app.put("/manufacturers/{manufacturer_id}", tags=["Производители"])
async def update_manufacturer(manufacturer_id: int, manufacturer_data: ManufacturerUpdate):
    """Обновить производителя"""
    async with create_session() as db:
        # Проверяем, существует ли производитель
        existing = await manufacturer.get_manufacturer_by_id(db, manufacturer_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Manufacturer not found")
        
        # Если обновляется категория, проверяем её существование
        if manufacturer_data.category_id and manufacturer_data.category_id != existing.category_id:
            category_check = await category.get_category_by_id(db, manufacturer_data.category_id)
            if not category_check:
                raise HTTPException(status_code=404, detail="Category not found")
        
        # Если обновляется имя, проверяем уникальность
        if manufacturer_data.name and manufacturer_data.name != existing.name:
            name_check = await manufacturer.get_manufacturer_by_name(db, manufacturer_data.name)
            if name_check:
                raise HTTPException(status_code=400, detail="Manufacturer with this name already exists")
        
        # Обновляем только переданные поля
        update_data = {k: v for k, v in manufacturer_data.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        updated_manufacturer = await manufacturer.update_manufacturer(db, manufacturer_id, update_data)
        return updated_manufacturer.to_dict()

@app.delete("/manufacturers/{manufacturer_id}", tags=["Производители"])
async def delete_manufacturer(manufacturer_id: int):
    """Удалить производителя"""
    async with create_session() as db:
        # Проверяем, существует ли производитель
        existing = await manufacturer.get_manufacturer_by_id(db, manufacturer_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Manufacturer not found")
        
        # Проверяем, есть ли связанные устройства
        related_devices = await device.get_devices_by_manufacturer(db, existing.name)
        if related_devices:
            raise HTTPException(
                status_code=400, 
                detail=f"Нельзя удалить производителя '{existing.name}', так как к нему привязаны устройства"
            )
        
        success = await manufacturer.delete_manufacturer(db, manufacturer_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete manufacturer")
        
        return {"message": f"Manufacturer {manufacturer_id} deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)