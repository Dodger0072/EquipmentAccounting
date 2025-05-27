
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from models.device import device
from models.db_session_sync import get_db, engine
from models.db_session_sync import Base
from schemas import EquipmentCreate
from fastapi.middleware import Middleware
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(engine)

@app.post("/add_device")
def add_device(equipment: EquipmentCreate, db: Session = Depends(get_db)):
    existing = db.query(device).filter(device.name == equipment.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Device with this name already exists")
    new_device = device(**equipment.model_dump())
    db.add(new_device)
    db.commit()
    db.refresh(new_device)
    return {"message": "Device added successfully", "id": new_device.id}

@app.get("/search")
def search_devices(db: Session = Depends(get_db)):
    devices = db.query(device).all()
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
                "releaseDate": d.releaseDate,
                "softwareStartDate": d.softwareStartDate,
                "softwareEndDate": d.softwareEndDate,
                "manufacturer":d.manufacturer,
                "waveRadius": d.waveRadius,
                "mapId": d.mapId,
                } 
                for d in devices
                ]
            }

@app.delete("/delete_device/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    db_device = db.query(device).filter(device.id == device_id).first()

    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")

    db.delete(db_device)
    db.commit()

    return {"message": f"Device {device_id} deleted successfully"}

@app.put("/update_device/{device_id}")
def update_device(device_id: int, updated_data: dict, db: Session = Depends(get_db)):
    db_device = db.query(device).filter(device.id == device_id).first()

    if not db_device:
        raise HTTPException(status_code=404, detail="Device not found")

    for key, value in updated_data.items():
        if hasattr(db_device, key):
            setattr(db_device, key, value)

    db.commit()
    db.refresh(db_device)

    return {"message": f"Device {device_id} обновлён", "device": db_device}

@app.post("/login")
def login(credentials: dict):
    if credentials.get("username") == "admin" and credentials.get("password") == "12345":
        return {"token": "my-secret-jwt"}
    raise HTTPException(status_code=401, detail="Invalid credentials")