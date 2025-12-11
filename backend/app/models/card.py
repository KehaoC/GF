from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class CustomCard(Base):
    """Custom card model for user-created cards in the card library"""
    __tablename__ = "custom_cards"

    id = Column(Integer, primary_key=True, index=True)
    card_type = Column(String, nullable=False)  # hook, inspiration, template, product, constraint
    image_url = Column(String, nullable=False)  # URL to the uploaded image
    text_content = Column(Text, nullable=True)  # Optional description text
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="custom_cards")
