import json
import os
from datetime import datetime
from typing import Any, Dict, Optional

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, "yojnasetu.db")}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(320), unique=True, nullable=False, index=True)

    # Complete citizen profile stored as JSON.
    profile_json = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


Base.metadata.create_all(bind=engine)


def get_user_by_email(email: str) -> Optional[User]:
    db = SessionLocal()
    try:
        return db.query(User).filter(User.email == email).first()
    finally:
        db.close()


def create_user(email: str, name: str) -> User:
    db = SessionLocal()
    try:
        user = User(email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def delete_user(email: str) -> None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            db.delete(user)
            db.commit()
    finally:
        db.close()


def update_user_profile(
    email: str,
    profile: Dict[str, Any],
) -> Optional[User]:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user:
            return None

        profile_data = dict(profile)
        profile_data["name"] = str(
            profile_data.get("name") or user.name
        ).strip()

        user.name = profile_data["name"]
        user.profile_json = json.dumps(
            profile_data,
            ensure_ascii=False,
        )
        user.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def get_user_profile(
    email: str,
) -> Optional[Dict[str, Any]]:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()

        if not user or not user.profile_json:
            return None

        try:
            return json.loads(user.profile_json)
        except json.JSONDecodeError:
            return None
    finally:
        db.close()


def user_to_dict(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "created_at": (
            user.created_at.isoformat()
            if user.created_at else None
        ),
        "updated_at": (
            user.updated_at.isoformat()
            if user.updated_at else None
        ),
    }
