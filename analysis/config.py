from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    redis_url: str = "redis://redis:6379"
    naver_client_id: str = ""
    naver_client_secret: str = ""
    youtube_api_key: str = ""


settings = Settings()
