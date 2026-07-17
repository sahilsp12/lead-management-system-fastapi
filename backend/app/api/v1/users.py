from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.dependencies import RoleChecker

from app.core.security import hash_password

from app.models.user import User

from app.schemas.user import UserOut, UserCreate, UserUpdate

router = APIRouter(prefix="/users", tags=["User Management"])

admin_only = RoleChecker(["Admin"])

@router.get("/", response_model=list[UserOut], dependencies=[Depends(admin_only)])

def list_users(db: Session = Depends(get_db)):

    """List all users in the system (Admin only)."""

    return db.query(User).all()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(admin_only)])

def create_user(user_in: UserCreate, db: Session = Depends(get_db)):

    """Create a new user (Admin only)."""

    existing_user = db.query(User).filter(User.email == user_in.email).first()

    if existing_user:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Email already registered"

        )

    hashed_pwd = hash_password(user_in.password)

    new_user = User(

        name=user_in.name,

        email=user_in.email,

        password=hashed_pwd,

        role=user_in.role

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return new_user

@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(admin_only)])

def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):

    """Update user details (Admin only)."""

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="User not found"

        )

    if user_in.name is not None:

        user.name = user_in.name

    if user_in.email is not None:

        email_taken = db.query(User).filter(User.email == user_in.email, User.id != user_id).first()

        if email_taken:

            raise HTTPException(

                status_code=status.HTTP_400_BAD_REQUEST,

                detail="Email already registered"

            )

        user.email = user_in.email

    if user_in.role is not None:

        user.role = user_in.role

    if user_in.password is not None:

        user.password = hash_password(user_in.password)

    db.commit()

    db.refresh(user)

    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_only)])

def delete_user(user_id: int, db: Session = Depends(get_db)):

    """Delete a user (Admin only)."""

    user = db.query(User).filter(User.id == user_id).first()

    if not user:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="User not found"

        )

    db.delete(user)

    db.commit()

    return

