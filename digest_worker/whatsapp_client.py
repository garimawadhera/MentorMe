from __future__ import annotations

from twilio.rest import Client


class WhatsAppClient:
    def __init__(self, account_sid: str, auth_token: str, from_number: str) -> None:
        self.client = Client(account_sid, auth_token)
        self.from_number = self._normalize(from_number)

    @staticmethod
    def _normalize(number: str) -> str:
        return number if number.startswith("whatsapp:") else f"whatsapp:{number}"

    def send_digest(self, to_number: str, digest_text: str) -> str:
        message = self.client.messages.create(
            from_=self.from_number,
            to=self._normalize(to_number),
            body=digest_text,
        )
        return message.sid
