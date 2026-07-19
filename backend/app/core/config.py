from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite+aiosqlite:///./dev.db"
    jwt_secret: str = "change-this-dev-secret-before-any-real-deployment"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480
    cors_origins: str = "http://localhost:3000"
    env: str = "development"

    # Optional — payments work via cash/card/UPI-at-counter without these.
    # Set both key id/secret to enable the "pay online" path via Razorpay
    # Checkout (see backend/app/services/billing.py).
    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None
    razorpay_webhook_secret: str | None = None

    # Only read by `python -m app.seed`, and only takes effect on the FIRST
    # seed of an empty database (seeding is a no-op once the restaurant exists).
    seed_owner_email: str = "owner@example.com"
    seed_owner_password: str = "ChangeMe123!"  # nosec - dev-only default

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sync_database_url(self) -> str:
        """Alembic needs a sync driver even though the app uses an async one."""
        return self.database_url.replace("+aiosqlite", "").replace("+asyncpg", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
