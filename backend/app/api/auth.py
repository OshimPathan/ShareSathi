from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.database.session import get_db
from app.core.hashing import verify_password
from app.core.jwt_handler import create_access_token
from app.config import settings
from app.models.user import User
from app.schemas.user_schema import UserCreate, UserResponse, Token
from app.repositories.user_repo import UserRepository

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user_repo = UserRepository(db)
    existing_user = await user_repo.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    from app.core.hashing import get_password_hash
    hashed_password = get_password_hash(user_in.password)
    user = await user_repo.create_user(user_in.email, hashed_password)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: AsyncSession = Depends(get_db)
):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
