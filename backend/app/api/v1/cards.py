from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, get_current_active_user
from app.models import User, CustomCard
from app.schemas import CustomCardCreate, CustomCardResponse

router = APIRouter()


@router.get("/", response_model=List[CustomCardResponse])
def list_custom_cards(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List user's custom cards"""
    cards = db.query(CustomCard).filter(
        CustomCard.owner_id == current_user.id
    ).order_by(CustomCard.created_at.desc()).all()

    return cards


@router.post("/", response_model=CustomCardResponse, status_code=status.HTTP_201_CREATED)
def create_custom_card(
    card_in: CustomCardCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new custom card"""
    # Validate card_type
    valid_types = ["hook", "inspiration", "template", "product", "constraint"]
    if card_in.card_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid card type. Must be one of: {', '.join(valid_types)}"
        )

    card = CustomCard(
        card_type=card_in.card_type,
        image_url=card_in.image_url,
        text_content=card_in.text_content,
        owner_id=current_user.id
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    return card


@router.get("/{card_id}", response_model=CustomCardResponse)
def get_custom_card(
    card_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a custom card by ID"""
    card = db.query(CustomCard).filter(CustomCard.id == card_id).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    # Check ownership
    if card.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_card(
    card_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a custom card"""
    card = db.query(CustomCard).filter(CustomCard.id == card_id).first()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Card not found"
        )

    # Check ownership
    if card.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )

    db.delete(card)
    db.commit()

    return None
