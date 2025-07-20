from datetime import date
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


class BookGenre(str, Enum):
    fiction = "Fiction"
    non_fiction = "Non‑fiction"
    fantasy = "Fantasy"
    sci_fi = "Sci‑fi"
    poetry = "Poetry"
    other = "Other"

class Author(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    last_name: str
    first_name: str
    patronymic: Optional[str] = None
    birth_date: date

    books: list["Book"] = Relationship(
    back_populates="author",
    sa_relationship_kwargs={
        "cascade": "all, delete-orphan",
        "lazy": "selectin",
    },
)

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    title: str
    pages: int
    genre: BookGenre

    author_id: int = Field(foreign_key="author.id")
    author: Optional[Author] = Relationship(back_populates="books")

class AuthorRead(SQLModel):
    id: int
    last_name: str
    first_name: str
    patronymic: Optional[str] = None
    birth_date: date
    books: List[Book] = []
