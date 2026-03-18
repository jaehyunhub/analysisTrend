import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from services.news_collector import NewsCollector
from services.cache import cache_set

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None

_CACHE_TTL = 1800  # 30분


async def _collect_news_keywords() -> None:
    """30분마다 뉴스 키워드를 수집하여 캐시에 저장합니다."""
    try:
        collector = NewsCollector()
        keywords = await collector.fetch(limit=30)
        await cache_set("news_keywords", [k.model_dump() for k in keywords], ttl=_CACHE_TTL)
        logger.info("뉴스 키워드 수집 완료: %d개", len(keywords))
    except Exception as e:
        logger.error("뉴스 키워드 수집 실패: %s", e)


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler()
        _scheduler.add_job(
            _collect_news_keywords,
            trigger=IntervalTrigger(minutes=30),
            id="news_keyword_collection",
            replace_existing=True,
            max_instances=1,
        )
    return _scheduler


async def start_scheduler() -> None:
    scheduler = get_scheduler()
    if not scheduler.running:
        scheduler.start()
        logger.info("APScheduler 시작 (뉴스 키워드 30분 주기)")


async def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
        logger.info("APScheduler 종료")
