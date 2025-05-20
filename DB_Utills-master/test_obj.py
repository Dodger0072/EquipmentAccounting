from datetime import datetime

from Backend import get_db
from models.device import device

test_device = device(
    name="Test Device",
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
bd = get_db()
test_device.update(bd)