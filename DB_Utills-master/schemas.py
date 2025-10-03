from pydantic import BaseModel
from typing import Optional, Union

class EquipmentCreate(BaseModel):
    name: str
    category: str
    place_id: str  # Название комнаты/помещения
    version: str
    id: Optional[int] = None
    releaseDate: str  # дата закупки
    softwareStartDate: str  # дата устаревания
    softwareEndDate: Optional[str] = None  # дата снятия
    updateDate: Optional[str] = None  # дата обновления по
    manufacturer: str
    xCord: Optional[float] = None
    yCord: Optional[float] = None
    mapId: Optional[int] = None

class EquipmentUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    place_id: Optional[str] = None
    version: Optional[str] = None
    releaseDate: Optional[str] = None
    softwareStartDate: Optional[str] = None
    softwareEndDate: Optional[str] = None
    updateDate: Optional[str] = None
    manufacturer: Optional[str] = None
    xCord: Optional[float] = None
    yCord: Optional[float] = None
    mapId: Optional[int] = None


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

class ManufacturerCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category_id: int

class ManufacturerUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None

class ManufacturerResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category_id: int
    category_name: Optional[str] = None 