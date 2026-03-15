from fastapi import FastAPI
from routers import health, chat, trends

app = FastAPI(title="AnalysisTrend Analysis Service")

app.include_router(health.router)
app.include_router(chat.router, prefix="/analyze")
app.include_router(trends.router, prefix="/trends")
