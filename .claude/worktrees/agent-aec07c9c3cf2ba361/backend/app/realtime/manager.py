import logging

from fastapi import WebSocket

from app.realtime.events import LiveEvent

logger = logging.getLogger(__name__)


class ConnectionManager:
    """In-process fan-out for realtime order/menu/settings/reservation events.

    Single-instance only (state lives in memory) — matches the previous
    EventEmitter-based SSE bus. Horizontally scaling to multiple backend
    instances would need a shared layer (e.g. Redis pub/sub) to fan events
    out across processes; documented here rather than built now since
    Phase 1 targets a single-location deployment.
    """

    def __init__(self) -> None:
        self.staff: set[WebSocket] = set()
        self.tables: dict[str, set[WebSocket]] = {}

    async def connect_staff(self, ws: WebSocket) -> None:
        await ws.accept()
        self.staff.add(ws)

    async def connect_guest(self, ws: WebSocket, table_code: str) -> None:
        await ws.accept()
        self.tables.setdefault(table_code, set()).add(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.staff.discard(ws)
        for sockets in self.tables.values():
            sockets.discard(ws)

    async def _send_all(self, sockets: set[WebSocket], payload: dict) -> None:
        dead: list[WebSocket] = []
        for ws in sockets:
            try:
                await ws.send_json(payload)
            except Exception:  # noqa: BLE001 - dead socket, drop it
                dead.append(ws)
        for ws in dead:
            sockets.discard(ws)

    async def broadcast_staff(self, event: LiveEvent) -> None:
        await self._send_all(self.staff, event.model_dump(mode="json"))

    async def broadcast_table(self, table_code: str, event: LiveEvent) -> None:
        sockets = self.tables.get(table_code)
        if sockets:
            await self._send_all(sockets, event.model_dump(mode="json"))

    async def broadcast_menu_update(self, item_id: str) -> None:
        from app.realtime.events import MenuUpdatedEvent

        event = MenuUpdatedEvent(item_id=item_id)
        payload = event.model_dump(mode="json")
        await self._send_all(self.staff, payload)
        for sockets in self.tables.values():
            await self._send_all(sockets, payload)


connection_manager = ConnectionManager()
