from pydantic import BaseModel
from typing import Optional, Union

class EquipmentCreate(BaseModel):
    name: str
    category: str
    place_id: str
    version: str
    id: Optional[int] = None
    releaseDate: str
    softwareStartDate: str
    softwareEndDate: str
    manufacturer: str
    xCord: float
    yCord: float
    waveRadius: Optional[float] = None
    mapId: Optional[int] = None 