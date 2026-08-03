import secrets
import time

TICKET_TTL_SECONDS = 60


class TicketStore:
    """One-time, short-lived tickets so a browser WebSocket (which can't send
    an Authorization header or read an httpOnly cookie cross-origin) can
    still prove who it is at connect time."""

    def __init__(self) -> None:
        self._tickets: dict[str, float] = {}

    def mint(self) -> str:
        token = secrets.token_urlsafe(32)
        self._tickets[token] = time.monotonic() + TICKET_TTL_SECONDS
        return token

    def consume(self, token: str) -> bool:
        expires_at = self._tickets.pop(token, None)
        if expires_at is None:
            return False
        return time.monotonic() <= expires_at


ticket_store = TicketStore()
