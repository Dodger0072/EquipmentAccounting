from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, String, Integer, Date, Float, ForeignKey
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
from datetime import date
from typing import Optional
from models.device import device
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body
from pydantic import BaseModel

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Base:
    allow_unmapped = True

    async def save(self, session: AsyncSession):
        session.add(self)
        await session.commit()


Base = declarative_base(cls=Base)

# Создание базы данных
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)




Base.metadata.create_all(bind=engine)


# Функция зависимости для получения сессии базы данных
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Эндпоинт для поиска устройств
@app.get("/search")
def search_items(q: Optional[str] = None, category: Optional[str] = None, place: Optional[str] = None,
                 version: Optional[str] = None, id: Optional[int] = None, releaseDate: Optional[date] = None,
                 softwareStartDate: Optional[date] = None, softwareEndDate: Optional[date] = None,
                 manufacturer: Optional[str] = None, xCord: Optional[float] = None,
                 yCoord: Optional[float] = None, waveRadius: Optional[float] = None, db: Session = Depends(get_db)):

    query = db.query(device)

    # Фильтрация по параметрам запроса
    if q:
        query = query.filter(device.name.ilike(f"%{q}%"))
    if category:
        query = query.filter(device.category == category)
    if place:
        query = query.filter(device.place.has(name=place))
    if version:
        query = query.filter(device.version == version)
    if id:
        query = query.filter(device.id == id)
    if releaseDate:
        query = query.filter(device.releaseDate == releaseDate)
    if softwareStartDate:
        query = query.filter(device.softwareStartDate == softwareStartDate)
    if softwareEndDate:
        query = query.filter(device.softwareEndDate == softwareEndDate)
    if manufacturer:
        query = query.filter(device.manufacturer == manufacturer)
    if xCord:
        query = query.filter(device.xCord == xCord)
    if yCoord:
        query = query.filter(device.yCoord == yCoord)
    if waveRadius:
        query = query.filter(device.waveRadius == waveRadius)

    result = query.all()

    categorized_result = {"computers": [], "router": [], "printer": [], "item": []}
    for device in result:
        device_info = {
            "name": device.name,
            "category": device.category,
            "place_id": device.place_id if device.place else None,
            "version": device.version,
            "id": device.id,
            "releaseDate": str(device.releaseDate),
            "softwareStartDate": str(device.softwareStartDate),
            "softwareEndDate": str(device.softwareEndDate),
            "manufacturer": device.manufacturer,
            "xCord": device.xCord,
            "yCoord": device.yCoord,
            "waveRadius": device.waveRadius
        }
        if device.category == "computers":
            categorized_result["computers"].append(device_info)
        elif device.category == "router":
            categorized_result["router"].append(device_info)
        elif device.category == "printer":
            categorized_result["printer"].append(device_info)
        else:
            categorized_result["item"].append(device_info)

    return categorized_result


class DeviceCreate(BaseModel):
    name: str
    category: str
    place_id: int
    version: str
    id: int
    releaseDate: date
    softwareStartDate: date
    softwareEndDate: date
    manufacturer: str
    xCord: float
    yCoord: float
    waveRadius: float
    mapId: int  # Добавьте это поле, так как оно есть во фронтенде


# Измените эндпоинт
@app.post("/add_device")
def add_device(device_data: DeviceCreate, db: Session = Depends(get_db)):
    # Проверяем, существует ли устройство с таким же именем
    if db.query(device).filter(device.name == device_data.name).first():
        raise HTTPException(status_code=400, detail="Device with this name already exists")

    # Создаем новое устройство
    new_device = device(
        name=device_data.name,
        category=device_data.category,
        place_id=device_data.place_id,
        version=device_data.version,
        id=device_data.id,
        releaseDate=device_data.releaseDate,
        softwareStartDate=device_data.softwareStartDate,
        softwareEndDate=device_data.softwareEndDate,
        manufacturer=device_data.manufacturer,
        xCord=device_data.xCord,
        yCoord=device_data.yCoord,
        waveRadius=device_data.waveRadius
    )

    db.add(new_device)
    db.commit()
    return {"message": "Device added successfully"}

if __name__ == "__main__":
    add_device(name="MyDevice", category="computers", place_id=1, version="1.0.0",
                     id=1, releaseDate=date(2021, 1, 1), softwareStartDate=date(2021, 1, 1),
                     softwareEndDate=date(2021, 1, 1), manufacturer="MyManufacturer",
                     xCord=0.0, yCoord=0.0, waveRadius=0.0)