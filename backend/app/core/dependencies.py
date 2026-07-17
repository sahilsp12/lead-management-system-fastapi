from fastapi import Depends, HTTPException, status

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.security import decode_access_token

from app.models.user import User

security_scheme = HTTPBearer()

def get_current_user(

    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),

    db: Session = Depends(get_db)

) -> User:

    """Extract and decode access token to retrieve current authenticated user."""

    token = credentials.credentials

    email = decode_access_token(token)

    if not email:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid or expired token",

            headers={"WWW-Authenticate": "Bearer"},

        )

    user = db.query(User).filter(User.email == email).first()

    if not user:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="User not found",

        )

    return user

class RoleChecker:

    """Dependency to check if the current user has any of the permitted roles."""

    def __init__(self, allowed_roles: list[str]):

        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:

        if current_user.role not in self.allowed_roles:

            raise HTTPException(

                status_code=status.HTTP_403_FORBIDDEN,

                detail="You do not have permission to access this resource",

            )

        return current_user

