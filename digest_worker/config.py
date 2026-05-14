from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import List

from dotenv import load_dotenv


DEFAULT_TOPICS = [
    "geopolitics",
    "global economy",
    "armed conflicts",
    "international diplomacy",
]


@dataclass(frozen=True)
class Settings:
    news_api_key: str
    anthropic_api_key: str
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_whatsapp_from: str
    anthropic_model: str
    digest_timezone: str
    digest_hour: int
    digest_minute: int
    max_articles_per_topic: int
    subscribers_file: Path
    default_topics: List[str]


def _required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise ValueError(f"Missing required environment variable: {name}")
    return value


def load_settings() -> Settings:
    load_dotenv()

    topics = os.getenv("DIGEST_TOPICS", ",".join(DEFAULT_TOPICS))
    parsed_topics = [topic.strip() for topic in topics.split(",") if topic.strip()]

    return Settings(
        news_api_key=_required_env("NEWS_API_KEY"),
        anthropic_api_key=_required_env("ANTHROPIC_API_KEY"),
        twilio_account_sid=_required_env("TWILIO_ACCOUNT_SID"),
        twilio_auth_token=_required_env("TWILIO_AUTH_TOKEN"),
        twilio_whatsapp_from=_required_env("TWILIO_WHATSAPP_FROM"),
        anthropic_model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-20250514").strip(),
        digest_timezone=os.getenv("DIGEST_TIMEZONE", "UTC").strip(),
        digest_hour=int(os.getenv("DIGEST_HOUR", "7")),
        digest_minute=int(os.getenv("DIGEST_MINUTE", "0")),
        max_articles_per_topic=int(os.getenv("MAX_ARTICLES_PER_TOPIC", "5")),
        subscribers_file=Path(
            os.getenv("SUBSCRIBERS_FILE", "digest_worker/data/subscribers.json")
        ),
        default_topics=parsed_topics or DEFAULT_TOPICS,
    )
