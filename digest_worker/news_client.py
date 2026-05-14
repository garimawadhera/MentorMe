from __future__ import annotations

from typing import Dict, List, TypedDict

import requests

NEWS_API_URL = "https://newsapi.org/v2/everything"


class Article(TypedDict):
    topic: str
    title: str
    description: str
    source: str
    url: str
    published_at: str


class NewsClient:
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key

    def fetch_headlines(
        self,
        query: str,
        max_articles: int = 5,
        language: str = "en",
    ) -> List[Article]:
        response = requests.get(
            NEWS_API_URL,
            headers={"X-Api-Key": self._api_key},
            params={
                "q": query,
                "language": language,
                "sortBy": "publishedAt",
                "pageSize": max_articles,
            },
            timeout=30,
        )
        try:
            response.raise_for_status()
        except requests.HTTPError as exc:
            detail = ""
            try:
                detail = f" | body: {response.text}"
            except Exception:
                detail = ""
            raise requests.HTTPError(f"NewsAPI request failed for '{query}'{detail}") from exc

        payload = response.json()
        articles = payload.get("articles", [])
        normalized: List[Article] = []
        for article in articles:
            title = str(article.get("title") or "").strip()
            url = str(article.get("url") or "").strip()
            if not title or not url:
                continue
            normalized.append(
                Article(
                    topic=query,
                    title=title,
                    description=str(article.get("description") or "").strip(),
                    source=str((article.get("source") or {}).get("name") or "").strip(),
                    url=url,
                    published_at=str(article.get("publishedAt") or "").strip(),
                )
            )
        return normalized


def fetch_news_by_topics(
    api_key: str,
    topics: List[str],
    max_articles_per_topic: int = 5,
    language: str = "en",
) -> Dict[str, List[Article]]:
    client = NewsClient(api_key=api_key)
    grouped_articles: Dict[str, List[Article]] = {}
    for topic in topics:
        grouped_articles[topic] = client.fetch_headlines(
            query=topic, max_articles=max_articles_per_topic, language=language
        )
    return grouped_articles
