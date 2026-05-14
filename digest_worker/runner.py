from __future__ import annotations

import logging
from typing import Sequence

from .config import Settings
from .news_client import Article, fetch_news_by_topics
from .subscribers import load_subscribers
from .summarizer import ClaudeSummarizer
from .whatsapp_client import WhatsAppClient

logger = logging.getLogger(__name__)


def _flatten_and_dedupe(grouped_articles: dict[str, list[Article]]) -> list[Article]:
    deduped: list[Article] = []
    seen_urls: set[str] = set()

    for topic_articles in grouped_articles.values():
        for article in topic_articles:
            if article.url in seen_urls:
                continue
            seen_urls.add(article.url)
            deduped.append(article)

    return deduped


def run_daily_digest(settings: Settings, topics: Sequence[str] | None = None) -> dict:
    selected_topics = list(topics) if topics else list(settings.default_topics)
    grouped_articles = fetch_news_by_topics(
        api_key=settings.news_api_key,
        topics=selected_topics,
        max_articles_per_topic=settings.max_articles_per_topic,
    )
    articles = _flatten_and_dedupe(grouped_articles)
    if not articles:
        raise RuntimeError("No articles found for configured topics.")

    summarizer = ClaudeSummarizer(
        api_key=settings.anthropic_api_key, model=settings.anthropic_model
    )
    digest_text = summarizer.summarize(articles=articles, topics=selected_topics)

    subscribers = load_subscribers(settings.subscribers_file)

    whatsapp = WhatsAppClient(
        account_sid=settings.twilio_account_sid,
        auth_token=settings.twilio_auth_token,
        from_number=settings.twilio_whatsapp_from,
    )
    message_sids = whatsapp.broadcast(subscribers=subscribers, digest_text=digest_text)

    summary = {
        "topics": selected_topics,
        "article_count": len(articles),
        "subscriber_count": len(subscribers),
        "messages_sent": len(message_sids),
    }
    logger.info("Digest run complete: %s", summary)
    return summary
