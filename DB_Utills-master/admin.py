# from dotenv import load_dotenv
from fastapi import FastAPI
from sqladmin import Admin


from models.db_session_sync import global_init
from views import PlaceAdmin, DeviceAdmin, UserAdmin

# load_dotenv("token.env")
engine = global_init()
app = FastAPI()
admin = Admin(app, engine)
admin.add_view(UserAdmin)
admin.add_view(PlaceAdmin)
admin.add_view(DeviceAdmin)

