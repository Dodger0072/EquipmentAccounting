import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    # Uvicorn на Windows по умолчанию берёт ProactorEventLoop (см. uvicorn.loops.asyncio);
    # psycopg_async с ним не работает, asyncpg часто даёт обрыв соединения.
    import uvicorn.loops.asyncio as _uvicorn_asyncio_loop

    def _selector_loop_factory(use_subprocess: bool = False):
        return asyncio.SelectorEventLoop

    _uvicorn_asyncio_loop.asyncio_loop_factory = _selector_loop_factory

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from models.device import device
from models.place import place
from models.category import category
from models.manufacturer import manufacturer
from models.classroom import classroom
from models.db_session import create_session, Base
from schemas import EquipmentCreate, EquipmentUpdate, CategoryCreate, CategoryUpdate, CategoryResponse, ManufacturerCreate, ManufacturerUpdate, ManufacturerResponse, ClassroomCreate, ClassroomUpdate, ClassroomResponse
from datetime import datetime
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import qrcode
import io
try:
    from services.snmp_service import SNMPService
    SNMP_AVAILABLE = True
except ImportError as e:
    SNMP_AVAILABLE = False
    print(f"WARNING: SNMP service not available: {e}")
    SNMPService = None

try:
    from services.network_discovery_service import NetworkDiscoveryService
    DISCOVERY_AVAILABLE = True
except ImportError as e:
    DISCOVERY_AVAILABLE = False
    print(f"WARNING: Network discovery service not available: {e}")
    NetworkDiscoveryService = None

from models.device_snmp_config import DeviceSNMPConfig
from models.config import Settings
from sqlalchemy import select
import logging

logger = logging.getLogger(__name__)

# Инициализация настроек
settings = Settings()

# Инициализация базы данных при запуске
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    from models.db_session import global_init
    await global_init()
    
    # Создаем дефолтные места, если их нет
    async with create_session() as db:
        existing_places = await place.get_all_places(db)
        if not existing_places:
            # Создаем дефолтные места
            default_places = [
                place(name="Этаж 2"),
                place(name="Этаж 3"),
                place(name="Этаж 4"),
            ]
            for p in default_places:
                db.add(p)
            await db.commit()
            print("Созданы дефолтные места (карты)")
    
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

@app.get("/places", tags=["Карты"])
async def get_places():
    """Получить все карты (места)"""
    async with create_session() as db:
        places = await place.get_all_places(db)
        return [{"id": p.id, "name": p.name} for p in places]

@app.post("/add_place", tags=["оборудование"])
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

@app.post("/add_device", tags=["оборудование"])
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

@app.get("/equipment/{device_id}", tags=["оборудование"])
async def get_device_by_id(device_id: int):
    """Получить информацию об оборудовании по ID"""
    async with create_session() as db:
        # Сначала проверяем существование устройства
        device_result = await db.execute(select(device).where(device.id == device_id))
        d = device_result.scalar_one_or_none()
        
        if not d:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Получаем категорию если она есть
        cat = None
        if d.category:
            category_result = await db.execute(select(category).where(category.name == d.category))
            cat = category_result.scalar_one_or_none()
        
        # Получаем SNMP конфигурацию
        snmp_config = await DeviceSNMPConfig.get_by_device_id(db, d.id)
        
        device_dict = {
            "name": d.name, 
            "category": d.category, 
            "categoryIcon": cat.icon if cat else 'default',
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
        
        # Добавляем SNMP конфигурацию если есть
        if snmp_config:
            snmp_config_dict = snmp_config.to_dict()
            # Если SNMP отключен, очищаем статус в возвращаемых данных, чтобы фронтенд не показывал его
            if not snmp_config.enabled:
                snmp_config_dict['status'] = None
                snmp_config_dict['response_time'] = None
                snmp_config_dict['last_check'] = None
            device_dict["snmp_config"] = snmp_config_dict
            # НЕ возвращаем статус если SNMP отключен или статус 'disabled'
            if snmp_config.enabled and snmp_config.status and snmp_config.status != 'disabled':
                device_dict["snmp_status"] = {
                    "status": snmp_config.status,
                    "message": f"Last check: {snmp_config.last_check.isoformat() if snmp_config.last_check else 'Never'}",
                    "response_time": snmp_config.response_time,
                    "timestamp": snmp_config.last_check.isoformat() if snmp_config.last_check else None
                }
        
        return device_dict

@app.get("/equipment/{device_id}/qr", tags=["оборудование"])
async def get_device_qr_code(device_id: int):
    """Генерирует QR код для оборудования"""
    async with create_session() as db:
        result = await db.execute(select(device).where(device.id == device_id))
        db_device = result.scalar_one_or_none()
        
        if not db_device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Создаем URL для QR кода из конфигурации
        # URL фронтенда можно задать через переменную окружения FRONTEND_URL
        # Например: export FRONTEND_URL="http://university.local:5173"
        frontend_url = settings.FRONTEND_URL
        qr_url = f"{frontend_url}/equipment/{device_id}"
        
        # Генерируем QR код
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_url)
        qr.make(fit=True)
        
        # Создаем изображение
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Сохраняем в байтовый поток
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        
        return StreamingResponse(
            io.BytesIO(img_byte_arr.read()),
            media_type="image/png",
            headers={"Content-Disposition": f"inline; filename=qr_{device_id}.png"}
        )

@app.get("/search", tags=["оборудование"])
async def search_devices():
    async with create_session() as db:
        # Делаем JOIN с таблицей категорий, чтобы получить иконку
        result = await db.execute(
            select(device, category)
            .outerjoin(category, device.category == category.name)
        )
        devices_with_categories = result.all()
        
        devices_list = []
        for d, cat in devices_with_categories:
            # Получаем SNMP конфигурацию для каждого устройства
            snmp_config = await DeviceSNMPConfig.get_by_device_id(db, d.id)
            
            device_dict = {
                "name": d.name, 
                "category": d.category, 
                "categoryIcon": cat.icon if cat else 'default',  # Добавляем иконку категории
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
            
            # Добавляем SNMP конфигурацию если есть
            if snmp_config:
                snmp_config_dict = snmp_config.to_dict()
                # Если SNMP отключен, очищаем статус в возвращаемых данных, чтобы фронтенд не показывал его
                if not snmp_config.enabled:
                    snmp_config_dict['status'] = None
                    snmp_config_dict['response_time'] = None
                    snmp_config_dict['last_check'] = None
                device_dict["snmp_config"] = snmp_config_dict
                # Также добавляем статус как отдельное поле для удобства
                # НЕ возвращаем статус если SNMP отключен или статус 'disabled'
                if snmp_config.enabled and snmp_config.status and snmp_config.status != 'disabled':
                    device_dict["snmp_status"] = {
                        "status": snmp_config.status,
                        "message": f"Last check: {snmp_config.last_check.isoformat() if snmp_config.last_check else 'Never'}",
                        "response_time": snmp_config.response_time,
                        "timestamp": snmp_config.last_check.isoformat() if snmp_config.last_check else None
                    }
            
            devices_list.append(device_dict)
        
        return {
            "devices": devices_list
        }


async def _delete_device_dependents(db: AsyncSession, device_id: int) -> None:
    """Удаляет строки, ссылающиеся на device.id (иначе FK блокирует удаление)."""
    await db.execute(delete(DeviceSNMPConfig).where(DeviceSNMPConfig.device_id == device_id))


@app.delete("/delete_device/{device_id}", tags=["оборудование"])
async def delete_device(device_id: int):
    async with create_session() as db:
        result = await db.execute(select(device).where(device.id == device_id))
        db_device = result.scalar_one_or_none()
        
        if not db_device:
            raise HTTPException(status_code=404, detail="Device not found")
        
        await _delete_device_dependents(db, device_id)
        await db.execute(delete(device).where(device.id == device_id))
        await db.commit()
        
        return {"message": f"Device {device_id} deleted successfully"}

@app.delete("/delete_devices_by_category/{category_id}", tags=["оборудование"])
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
        
        for d in devices:
            await _delete_device_dependents(db, d.id)
        await db.execute(delete(device).where(device.category == category_obj.name))
        await db.commit()
        
        return {
            "message": f"All devices from category '{category_obj.name}' deleted successfully",
            "deleted_count": len(devices)
        }

@app.put("/update_device/{device_id}", tags=["оборудование"])
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
        
        # Убрана проверка уникальности названия - производители могут иметь одинаковые названия в разных категориях
        
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
        
        # Убрана проверка уникальности названия - производители могут иметь одинаковые названия в разных категориях
        
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

# API endpoints для аудиторий
@app.get("/classrooms", tags=["Аудитории"])
async def get_classrooms():
    """Получить все аудитории"""
    async with create_session() as db:
        classrooms = await classroom.get_all_classrooms(db)
        return [cls.to_dict() for cls in classrooms]

@app.get("/classrooms/map/{map_id}", tags=["Аудитории"])
async def get_classrooms_by_map(map_id: int):
    """Получить все аудитории для конкретной карты"""
    async with create_session() as db:
        classrooms = await classroom.get_classrooms_by_map(db, map_id)
        return [cls.to_dict() for cls in classrooms]

@app.get("/classrooms/find-by-point", tags=["Аудитории"])
async def find_classroom_by_point(map_id: int, x: float, y: float):
    """Найти аудиторию по координатам точки на карте"""
    async with create_session() as db:
        found_classroom = await classroom.find_classroom_by_point(db, map_id, x, y)
        if not found_classroom:
            return {"classroom": None}
        return {"classroom": found_classroom.to_dict()}

@app.post("/classrooms", tags=["Аудитории"])
async def create_classroom(classroom_data: ClassroomCreate):
    """Создать новую аудиторию"""
    async with create_session() as db:
        # Проверяем, существует ли карта
        place_result = await db.execute(select(place).where(place.id == classroom_data.map_id))
        place_obj = place_result.scalar_one_or_none()
        
        # Если карта не найдена, создаем её автоматически
        if not place_obj:
            # Создаем новое место с именем по умолчанию
            new_place = place(name=f"Карта {classroom_data.map_id}")
            db.add(new_place)
            await db.commit()
            await db.refresh(new_place)
            # Если ID не совпадает, обновляем map_id
            if new_place.id != classroom_data.map_id:
                # Используем созданный ID
                classroom_data.map_id = new_place.id
        
        # Проверяем валидность полигона
        if not classroom_data.polygon_coordinates or len(classroom_data.polygon_coordinates) < 3:
            raise HTTPException(status_code=400, detail="Polygon must have at least 3 points")
        
        new_classroom = await classroom.insert_classroom(db, classroom_data.model_dump())
        return new_classroom.to_dict()

@app.get("/classrooms/{classroom_id}", tags=["Аудитории"])
async def get_classroom(classroom_id: int):
    """Получить аудиторию по ID"""
    async with create_session() as db:
        cls = await classroom.get_classroom_by_id(db, classroom_id)
        if not cls:
            raise HTTPException(status_code=404, detail="Classroom not found")
        return cls.to_dict()

@app.put("/classrooms/{classroom_id}", tags=["Аудитории"])
async def update_classroom(classroom_id: int, classroom_data: ClassroomUpdate):
    """Обновить аудиторию"""
    async with create_session() as db:
        existing = await classroom.get_classroom_by_id(db, classroom_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Classroom not found")
        
        # Если обновляется map_id, проверяем существование карты
        if classroom_data.map_id and classroom_data.map_id != existing.map_id:
            place_result = await db.execute(select(place).where(place.id == classroom_data.map_id))
            if not place_result.scalar_one_or_none():
                raise HTTPException(status_code=404, detail="Map not found")
        
        # Проверяем валидность полигона если он обновляется
        if classroom_data.polygon_coordinates and len(classroom_data.polygon_coordinates) < 3:
            raise HTTPException(status_code=400, detail="Polygon must have at least 3 points")
        
        update_data = {k: v for k, v in classroom_data.model_dump().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        updated_classroom = await classroom.update_classroom(db, classroom_id, update_data)
        return updated_classroom.to_dict()

@app.delete("/classrooms/{classroom_id}", tags=["Аудитории"])
async def delete_classroom(classroom_id: int):
    """Удалить аудиторию"""
    try:
        async with create_session() as db:
            existing = await classroom.get_classroom_by_id(db, classroom_id)
            if not existing:
                raise HTTPException(status_code=404, detail="Classroom not found")
            
            # Проверяем, есть ли связанные устройства
            related_devices = await classroom.get_devices_by_classroom(db, existing.name)
            if related_devices and len(related_devices) > 0:
                # Преобразуем устройства в словари синхронно, так как они уже загружены
                devices_list = []
                for d in related_devices:
                    devices_list.append({
                        'id': d.id,
                        'name': d.name,
                        'category': d.category,
                        'place_id': d.place_id,
                    })
                raise HTTPException(
                    status_code=400, 
                    detail={
                        "message": f"Нельзя удалить аудиторию '{existing.name}', так как к ней привязаны устройства",
                        "devices": devices_list
                    }
                )
            
            success = await classroom.delete_classroom(db, classroom_id)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to delete classroom")
            
            return {"message": f"Classroom {classroom_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting classroom {classroom_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# SNMP Monitoring Endpoints
snmp_service = SNMPService() if SNMP_AVAILABLE else None

@app.get("/snmp/check/{device_id}", tags=["SNMP Monitoring"])
async def check_device_snmp(device_id: int, db: AsyncSession = Depends(create_session)):
    """Проверяет статус конкретного устройства через SNMP"""
    if not SNMP_AVAILABLE or not snmp_service:
        raise HTTPException(status_code=503, detail="SNMP service is not available. Install pysnmp: pip install pysnmp")
    try:
        # Получаем устройство из базы данных
        device_obj = await device.get_device_by_id(db, device_id)
        if not device_obj:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Получаем SNMP конфигурацию
        snmp_config = await DeviceSNMPConfig.get_by_device_id(db, device_id)
        if not snmp_config:
            raise HTTPException(status_code=404, detail="SNMP configuration not found for this device")
        
        if not snmp_config.enabled:
            return {
                'status': 'disabled',
                'message': 'SNMP monitoring is disabled for this device',
                'response_time': None,
                'timestamp': datetime.now().isoformat()
            }
        
        # Преобразуем в словарь для SNMP сервиса
        device_config = {
            'snmp_enabled': 'true',
            'snmp_ip': snmp_config.ip_address,
            'snmp_port': snmp_config.port,
            'snmp_community': snmp_config.community,
            'snmp_version': snmp_config.version,
            'snmp_username': snmp_config.username,
            'snmp_password': snmp_config.password,
            'snmp_auth_protocol': snmp_config.auth_protocol,
            'snmp_priv_protocol': snmp_config.priv_protocol
        }
        
        # Выполняем SNMP проверку
        result = await snmp_service.check_device_status(device_config)
        
        # Обновляем статус в базе данных для всех статусов кроме 'disabled'
        if result['status'] in ['up', 'down', 'error']:
            snmp_config.status = result['status']
            snmp_config.response_time = result.get('response_time')
            snmp_config.last_check = datetime.now()
            await db.commit()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SNMP check failed: {str(e)}")

@app.get("/snmp/check-all", tags=["SNMP Monitoring"])
async def check_all_devices_snmp(db: AsyncSession = Depends(create_session)):
    """Проверяет статус всех устройств с включенным SNMP мониторингом"""
    if not SNMP_AVAILABLE or not snmp_service:
        raise HTTPException(status_code=503, detail="SNMP service is not available")
    try:
        # Получаем все включенные SNMP конфигурации
        snmp_configs = await DeviceSNMPConfig.get_all_enabled(db)
        
        if not snmp_configs:
            return {"message": "No devices with SNMP monitoring enabled", "results": {}}
        
        # Преобразуем в конфигурации для SNMP сервиса
        device_configs = []
        config_map = {}  # для связи device_id с конфигурацией
        
        for snmp_config in snmp_configs:
            device_config = {
                'id': snmp_config.device_id,
                'snmp_enabled': 'true',
                'snmp_ip': snmp_config.ip_address,
                'snmp_port': snmp_config.port,
                'snmp_community': snmp_config.community,
                'snmp_version': snmp_config.version,
                'snmp_username': snmp_config.username,
                'snmp_password': snmp_config.password,
                'snmp_auth_protocol': snmp_config.auth_protocol,
                'snmp_priv_protocol': snmp_config.priv_protocol
            }
            device_configs.append(device_config)
            config_map[snmp_config.device_id] = snmp_config
        
        # Выполняем массовую проверку
        results = await snmp_service.bulk_check_devices(device_configs)
        
        # Обновляем статусы в базе данных
        for device_id, result in results.items():
            if device_id in config_map and result['status'] in ['up', 'down', 'error']:
                snmp_config = config_map[device_id]
                snmp_config.status = result['status']
                snmp_config.response_time = result.get('response_time')
                snmp_config.last_check = datetime.now()
        
        await db.commit()
        
        return {
            "message": f"Checked {len(snmp_configs)} devices",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk SNMP check failed: {str(e)}")

@app.get("/snmp/interfaces/{device_id}", tags=["SNMP Monitoring"])
async def get_device_interfaces(device_id: int, db: AsyncSession = Depends(create_session)):
    """Получает информацию об интерфейсах устройства"""
    if not SNMP_AVAILABLE or not snmp_service:
        raise HTTPException(status_code=503, detail="SNMP service is not available")
    try:
        # Получаем устройство из базы данных
        device_obj = await device.get_device_by_id(db, device_id)
        if not device_obj:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Получаем SNMP конфигурацию
        snmp_config = await DeviceSNMPConfig.get_by_device_id(db, device_id)
        if not snmp_config or not snmp_config.enabled:
            raise HTTPException(status_code=400, detail="SNMP monitoring not enabled for this device")
        
        # Преобразуем в словарь для SNMP сервиса
        device_config = {
            'snmp_enabled': 'true',
            'snmp_ip': snmp_config.ip_address,
            'snmp_port': snmp_config.port,
            'snmp_community': snmp_config.community,
            'snmp_version': snmp_config.version,
            'snmp_username': snmp_config.username,
            'snmp_password': snmp_config.password,
            'snmp_auth_protocol': snmp_config.auth_protocol,
            'snmp_priv_protocol': snmp_config.priv_protocol
        }
        
        # Получаем информацию об интерфейсах
        result = await snmp_service.get_interface_status(device_config)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get interface status: {str(e)}")

@app.post("/snmp/config", tags=["SNMP Monitoring"])
async def create_or_update_snmp_config(snmp_config_data: dict, db: AsyncSession = Depends(create_session)):
    """Создает или обновляет SNMP конфигурацию устройства"""
    try:
        # Валидируем обязательные поля
        if 'device_id' not in snmp_config_data:
            raise HTTPException(status_code=400, detail="Missing required field: device_id")
        if 'ip_address' not in snmp_config_data:
            raise HTTPException(status_code=400, detail="Missing required field: ip_address")
        
        device_id = snmp_config_data['device_id']
        
        # Проверяем, что устройство существует
        device_obj = await device.get_device_by_id(db, device_id)
        if not device_obj:
            raise HTTPException(status_code=404, detail="Device not found")
        
        # Получаем значение enabled (явно проверяем на False, чтобы не использовать default)
        enabled_value = snmp_config_data.get('enabled')
        if enabled_value is None:
            enabled_value = True  # По умолчанию включено
        
        # Подготавливаем данные для конфигурации
        config_data = {
            'enabled': enabled_value,
            'ip_address': snmp_config_data['ip_address'],
            'port': snmp_config_data.get('port', 161),
            'community': snmp_config_data.get('community', 'public'),
            'version': snmp_config_data.get('version', '2c'),
            'username': snmp_config_data.get('username'),
            'password': snmp_config_data.get('password'),
            'auth_protocol': snmp_config_data.get('auth_protocol', 'MD5'),
            'priv_protocol': snmp_config_data.get('priv_protocol', 'DES'),
            'timeout': snmp_config_data.get('timeout', 5),
            'retries': snmp_config_data.get('retries', 2),
            'check_interval': snmp_config_data.get('check_interval', 300)
        }
        
        # Если SNMP отключен, очищаем статус и связанные поля
        # Важно: явно устанавливаем эти поля, чтобы очистить их в базе данных
        if not enabled_value:
            # Используем специальное значение для очистки статуса
            # В базе будет храниться 'disabled', но при возврате данных мы его очистим
            config_data['status'] = 'disabled'
            config_data['response_time'] = None
            config_data['last_check'] = None
        
        # Сохраняем все поля, включая None значения для явной очистки
        # Но фильтруем None для остальных полей
        if not enabled_value:
            # При отключении сохраняем все поля, включая None для response_time и last_check
            # чтобы явно очистить их в базе
            pass  # Оставляем все поля в config_data
        else:
            # При включении удаляем None значения
            config_data = {k: v for k, v in config_data.items() if v is not None}
        
        # Создаем или обновляем конфигурацию
        snmp_config = await DeviceSNMPConfig.create_or_update(db, device_id, config_data)
        
        return {
            "message": "SNMP configuration created/updated successfully",
            "config": snmp_config.to_dict()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update SNMP config: {str(e)}")

@app.get("/snmp/status", tags=["SNMP Monitoring"])
async def get_snmp_status_summary(db: AsyncSession = Depends(create_session)):
    """Получает сводку по статусу SNMP мониторинга"""
    try:
        # Получаем все устройства
        devices = await device.get_all_devices(db)
        total_devices = len(devices)
        
        # Получаем все SNMP конфигурации
        result = await db.execute(select(DeviceSNMPConfig))
        all_snmp_configs = result.scalars().all()
        
        # Подсчитываем статистику
        snmp_enabled = len([c for c in all_snmp_configs if c.enabled])
        snmp_up = len([c for c in all_snmp_configs if c.status == 'up'])
        snmp_down = len([c for c in all_snmp_configs if c.status == 'down'])
        snmp_unknown = len([c for c in all_snmp_configs if c.status == 'unknown' or c.status is None])
        
        return {
            "total_devices": total_devices,
            "snmp_enabled": snmp_enabled,
            "snmp_status": {
                "up": snmp_up,
                "down": snmp_down,
                "unknown": snmp_unknown
            },
            "snmp_coverage": round((snmp_enabled / total_devices * 100) if total_devices > 0 else 0, 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get SNMP status: {str(e)}")

# Network Discovery Endpoints
discovery_service = NetworkDiscoveryService() if DISCOVERY_AVAILABLE else None

@app.get("/snmp/discover/subnet", tags=["SNMP Discovery"])
async def get_local_subnet():
    """Определяет локальную подсеть сервера для подстановки по умолчанию"""
    import socket
    import ipaddress as _ip
    try:
        # Открываем UDP-сокет, чтобы узнать IP, через который идёт маршрут наружу
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        # Считаем подсеть /24
        net = _ip.IPv4Network(f"{local_ip}/24", strict=False)
        return {"subnet": str(net), "local_ip": local_ip}
    except Exception:
        return {"subnet": "192.168.0.0/24", "local_ip": ""}

@app.post("/snmp/discover", tags=["SNMP Discovery"])
async def discover_network_devices(body: dict):
    """Сканирует подсеть и возвращает найденные SNMP-устройства"""
    if not DISCOVERY_AVAILABLE or not discovery_service:
        raise HTTPException(
            status_code=503,
            detail="Network discovery service is not available. Install pysnmp: pip install pysnmp",
        )

    subnet = body.get("subnet")
    if not subnet:
        raise HTTPException(status_code=400, detail="Missing required field: subnet")

    communities = body.get("communities", ["public"])
    timeout = body.get("timeout", 2.0)
    port = body.get("port", 161)
    ping_timeout_ms = int(body.get("ping_timeout_ms", 1200))

    svc = NetworkDiscoveryService(timeout=float(timeout), retries=1, concurrency=50)
    try:
        result = await svc.discover(
            subnet,
            communities=communities,
            port=int(port),
            ping_timeout_ms=ping_timeout_ms,
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        import traceback
        logger.error(f"Discovery failed:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Discovery failed: {exc}")


@app.post("/snmp/discover/import", tags=["SNMP Discovery"])
async def import_discovered_devices(body: dict, db: AsyncSession = Depends(create_session)):
    """Импортирует выбранные устройства из результатов сканирования в БД"""
    devices_data = body.get("devices", [])
    if not devices_data:
        raise HTTPException(status_code=400, detail="No devices provided for import")

    category_name = body.get("category", "")
    place_name = body.get("place_id", "")
    x_cord = body.get("xCord", 0.0)
    y_cord = body.get("yCord", 0.0)
    map_id = body.get("mapId", None)

    imported = []

    for dev in devices_data:
        ip = dev.get("ip", "")
        name = dev.get("name") or ip
        manufacturer_name = dev.get("manufacturer_guess", "")

        device_data = {
            "name": name,
            "category": category_name,
            "place_id": place_name,
            "version": "",
            "manufacturer": manufacturer_name,
            "xCord": x_cord,
            "yCord": y_cord,
            "mapId": map_id,
        }
        try:
            new_device = await device.insert_device(db, device_data)

            snmp_config_data = {
                "enabled": True,
                "ip_address": ip,
                "port": dev.get("port", 161),
                "community": dev.get("community", "public"),
                "version": dev.get("snmp_version", "2c"),
                "status": "unknown",
            }
            await DeviceSNMPConfig.create_or_update(db, new_device.id, snmp_config_data)

            imported.append({
                "id": new_device.id,
                "name": name,
                "ip": ip,
            })
        except Exception as exc:
            logger.error(f"Failed to import device {ip}: {exc}")
            continue

    return {"imported": imported, "count": len(imported)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)