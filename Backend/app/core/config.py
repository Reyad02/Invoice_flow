from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-5.4-mini"
    MAX_FILE_SIZE_MB: int = 20
    MIN_EXTRACTED_TEXT_CHARS: int = 100

    class Config:
        env_file = f'{BASE_DIR}/.env'


settings = Settings()