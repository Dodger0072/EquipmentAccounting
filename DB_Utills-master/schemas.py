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
    icon: Optional[str] = 'default'

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None

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

class ClassroomCreate(BaseModel):
    name: str
    map_id: int
    polygon_coordinates: list  # List of {x, y} points
    description: Optional[str] = None

class ClassroomUpdate(BaseModel):
    name: Optional[str] = None
    map_id: Optional[int] = None
    polygon_coordinates: Optional[list] = None
    description: Optional[str] = None

class ClassroomResponse(BaseModel):
    id: int
    name: str
    map_id: int
    polygon_coordinates: list
    description: Optional[str] = None


# --- Auth schemas ---

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    role: str = "student"

class UserUpdate(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: str
    role: str
    is_active: bool
    created_at: Optional[str] = None


# --- Ticket schemas ---

class TicketCreate(BaseModel):
    device_id: int
    title: str
    description: str

class TicketStatusUpdate(BaseModel):
    status: str  # open, in_progress, closed

class TicketResponse(BaseModel):
    id: int
    device_id: int
    device_name: Optional[str] = None
    author_id: int
    author_name: Optional[str] = None
    title: str
    description: str
    status: str
    created_at: Optional[str] = None
    closed_at: Optional[str] = None