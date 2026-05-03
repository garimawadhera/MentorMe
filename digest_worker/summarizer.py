from __future__ import annotations

import json
from typing import Sequence

from anthropic import Anthropic

from .news_client import Article

SYSTEM_PROMPT = (
    "You are a world affairs journalist. Transform raw headline inputs into a concise "
    "WhatsApp-ready digest. Write in clear, factual language and avoid sensationalism."
)


def _build_user_prompt(articles: Sequence[Article], topics: Sequence[str]) -> str:
    serialized = json.dumps([article.to_dict() for article in articles], ensure_ascii=True)
    joined_topics = ", ".join(topics)
    return f"""
Summarize the following news articles into a 300-word WhatsApp newsletter.

Requirements:
- Audience: busy readers who need the global picture fast.
- Organize by region/theme where useful.
- Use short paragraphs and emoji bullets for readability.
- Keep neutral tone and prioritize verified facts from the provided data only.
- Include a closing "What to watch next" section with 2-3 forward-looking bullets.
- Do not invent details and do not include links.

Priority topics: {joined_topics}

Input articles (JSON):
{serialized}
""".strip()


class ClaudeSummarizer:
    def __init__(self, api_key: str, model: str) -> None:
        self._client = Anthropic(api_key=api_key)
        self._model = model

    def summarize(self, articles: Sequence[Article], topics: Sequence[str]) -> str:
        if not articles:
            return (
                "Daily World Digest\n\n"
                "No major stories were available from the configured feeds today.\n"
                "What to watch next:\n"
                "- Monitor major geopolitical meetings\n"
                "- Track macroeconomic indicators\n"
                "- Follow conflict de-escalation signals"
            )

        message = self._client.messages.create(
            model=self._model,
            max_tokens=900,
            temperature=0.2,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": _build_user_prompt(articles=articles, topics=topics),
                }
            ],
        )

        text_blocks = []
        for block in message.content:
            text = getattr(block, "text", None)
            if text:
                text_blocks.append(text)
        return "\n".join(text_blocks).strip()
