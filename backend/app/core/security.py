from datetime import datetime, timedelta, timezone

from typing import Any, Union

import bcrypt

from jose import jwt

from app.core.config import settings

def hash_password(password: str) -> str:

    """Hash a clear text password using bcrypt."""

    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(password_bytes, salt)

    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:

    """Verify a clear text password against a bcrypt hash."""

    plain_bytes = plain_password.encode("utf-8")

    hashed_bytes = hashed_password.encode("utf-8")

    try:

        return bcrypt.checkpw(plain_bytes, hashed_bytes)

    except Exception:

        return False

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:

    """Generate a JWT access token for a subject (usually user email)."""

    if expires_delta:

        expire = datetime.now(timezone.utc) + expires_delta

    else:

        expire = datetime.now(timezone.utc) + timedelta(

            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES

        )

    to_encode = {"exp": expire, "sub": str(subject)}

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return encoded_jwt

def decode_access_token(token: str) -> Union[str, None]:

    """Decode a JWT access token and return the subject if valid, else None."""

    try:

        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        return decoded_token.get("sub")

    except Exception:

        return None

