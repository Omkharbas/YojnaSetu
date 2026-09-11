import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr


# =========================================================
# CONFIGURATION
# =========================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET",
    "change-this-secret-before-production"
)

ALGORITHM = "HS256"
OTP_EXPIRY_MINUTES = 5


# =========================================================
# HACKATHON PROTOTYPE STORAGE
# =========================================================

USERS: Dict[str, dict] = {}
OTPS: Dict[str, dict] = {}

security = HTTPBearer(auto_error=False)


# =========================================================
# REQUEST MODELS
# =========================================================

class SignupRequest(BaseModel):
    name: str
    email: EmailStr


class OTPRequest(BaseModel):
    email: EmailStr


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# =========================================================
# HELPERS
# =========================================================

def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


# =========================================================
# CREATE OTP
# =========================================================

def create_otp(email: str) -> str:

    otp = f"{secrets.randbelow(1_000_000):06d}"

    OTPS[email] = {
        "otp_hash": hash_otp(otp),
        "expires_at": (
            datetime.now(timezone.utc)
            + timedelta(minutes=OTP_EXPIRY_MINUTES)
        ),
        "attempts": 0,
    }

    return otp


# =========================================================
# CREATE JWT TOKEN
# =========================================================

def create_token(email: str) -> str:

    return jwt.encode(
        {
            "sub": email,
            "exp": (
                datetime.now(timezone.utc)
                + timedelta(days=7)
            ),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:

        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = normalize_email(
            payload.get("sub", "")
        )

    except jwt.PyJWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = USERS.get(email)

    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user