from __future__ import annotations

import argparse
import logging
import time
from datetime import datetime
from zoneinfo import ZoneInfo

from digest_worker.config import Settings, load_settings
from digest_worker.runner import run_daily_digest


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s - %(message)s",
)
logger = logging.getLogger(__name__)


def _is_scheduled_time(settings: Settings) -> bool:
    now = datetime.now(ZoneInfo(settings.digest_timezone))
    return now.hour == settings.digest_hour and now.minute == settings.digest_minute


def _run_once(settings: Settings) -> None:
    result = run_daily_digest(settings=settings)
    logger.info(
        "Digest sent: topics=%s articles=%d subscribers=%d messages=%d",
        ", ".join(result["topics"]),
        result["article_count"],
        result["subscriber_count"],
        result["messages_sent"],
    )


def _run_scheduler(settings: Settings) -> None:
    wait_seconds = 30
    logger.info(
        "Scheduler active for %02d:%02d (%s).",
        settings.digest_hour,
        settings.digest_minute,
        settings.digest_timezone,
    )

    while True:
        if _is_scheduled_time(settings):
            logger.info("Scheduled digest execution starting.")
            _run_once(settings=settings)
            # Sleep past the current minute to avoid duplicate sends.
            time.sleep(65)
            continue
        time.sleep(wait_seconds)


def main() -> None:
    parser = argparse.ArgumentParser(description="WhatsApp news digest worker")
    parser.add_argument(
        "--once",
        action="store_true",
        help="Run digest immediately one time and exit.",
    )
    args = parser.parse_args()

    settings = load_settings()

    if args.once:
        _run_once(settings=settings)
        return

    _run_scheduler(settings=settings)


if __name__ == "__main__":
    main()
