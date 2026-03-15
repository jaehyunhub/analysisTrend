from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str = "redis://redis:6379"
    naver_client_id: str = ""
    naver_client_secret: str = ""
    youtube_api_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
