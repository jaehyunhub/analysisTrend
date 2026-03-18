from contextlib import asynccontextmanager
from fastapi import FastAPI
from routers import health, chat, trends
from tasks.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await start_scheduler()
    yield
    await stop_scheduler()


app = FastAPI(title="AnalysisTrend Analysis Service", lifespan=lifespan)

app.include_router(health.router)
app.include_router(chat.router, prefix="/analyze")
app.include_router(trends.router, prefix="/trends")
