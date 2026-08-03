from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, new_uuid


class RestaurantTable(Base):
    """A physical table. Named RestaurantTable to avoid clashing with
    sqlalchemy.Table."""

    __tablename__ = "restaurant_tables"
    __table_args__ = (UniqueConstraint("restaurant_id", "code", name="uq_table_code_per_restaurant"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    restaurant_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("restaurants.id", ondelete="CASCADE"), index=True
    )
    code: Mapped[str] = mapped_column(String(20))  # "T1", "T2", ...
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
