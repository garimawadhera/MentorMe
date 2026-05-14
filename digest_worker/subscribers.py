from __future__ import annotations

import json
from pathlib import Path
from typing import List


def load_subscribers(path: Path) -> List[str]:
    if not path.exists():
        raise FileNotFoundError(
            f"Subscribers file not found at {path}. Create it using the sample JSON."
        )

    raw = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        raise ValueError("Subscribers file must be a JSON array.")

    subscribers: List[str] = []
    for entry in raw:
        if isinstance(entry, str) and entry.strip():
            subscribers.append(entry.strip())
            continue

        if isinstance(entry, dict):
            active = entry.get("active", True)
            phone = entry.get("phone")
            if active and isinstance(phone, str) and phone.strip():
                subscribers.append(phone.strip())

    if not subscribers:
        raise ValueError("Subscribers list is empty.")

    return subscribers
