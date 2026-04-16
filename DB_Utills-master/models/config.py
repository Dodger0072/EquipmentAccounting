from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv
import os

# Загружаем переменные окружения из .env файла
load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    DB_HOST: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    DB_NAME: str
    FRONTEND_URL: str = "http://localhost:5173"  # URL фронтенда для QR кодов (можно задать через переменную окружения)
    
    @property
    def DATABASE_URL_asycopg(self):
        return (
            f"postgresql+psycopg_async://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )