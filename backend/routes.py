from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlmodel import Session, select
from datetime import date
from sqlalchemy.orm import selectinload

from .database import get_session
from .helpers import clean_birth_date, assert_pages_positive, assert_genre_valid
from .models import Author, Book, BookGenre, AuthorRead

router = APIRouter()

# ---------------------------------- AUTHOR ROUTES ----------------------------------
@router.get("/authors", response_model=list[AuthorRead])
def list_authors(session: Session = Depends(get_session)):
    stmt = select(Author).options(selectinload(Author.books))
    return session.exec(stmt).all()

@router.get("/authors/{author_id}", response_model=AuthorRead)
def get_author(author_id: int, session: Session = Depends(get_session)):
    stmt = (
        select(Author)
        .where(Author.id == author_id)
        .options(selectinload(Author.books))
    )
    author = session.exec(stmt).one_or_none()
    if not author:
        raise HTTPException(404, "Author not found")
    return author


@router.post("/authors", response_model=Author, status_code=status.HTTP_201_CREATED)
def create_author(
    payload: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
) -> Author:
    books_data: List[Dict[str, Any]] = payload.pop("books", [])
    author = Author(**payload)

    author.birth_date = clean_birth_date(author.birth_date)

    for item in books_data:
        assert_pages_positive(item.get("pages"))
        author.books.append(Book(**item))

    session.add(author)
    session.commit()
    session.refresh(author)
    return author


@router.put("/authors/{author_id}", response_model=Author)
def update_author(
    author_id: int,
    payload: Dict[str, Any] = Body(...),
    session: Session = Depends(get_session),
) -> Author:
    db_author = session.get(Author, author_id)
    if not db_author:
        raise HTTPException(404, "Author not found")

    books_data = payload.pop("books", [])

    for k, v in payload.items():
        setattr(db_author, k, v)

    db_author.birth_date = clean_birth_date(db_author.birth_date)

    db_author.books.clear()
    for item in books_data:
        assert_pages_positive(item.get("pages"))
        db_author.books.append(Book(**item))

    session.commit()
    session.refresh(db_author)
    return db_author


@router.delete("/authors/{author_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_author(author_id: int, session: Session = Depends(get_session)) -> None:
    db_author = session.get(Author, author_id)
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")
    session.delete(db_author)
    session.commit()
    return None


# ---------------------------------- BOOK ROUTES ----------------------------------
@router.get("/books", response_model=list[Book])
def list_books(
    genre: Optional[BookGenre] = Query(None),
    author_id: Optional[int] = Query(None),
    session: Session = Depends(get_session),
) -> List[Book]:
    query = select(Book)
    if genre:
        query = query.where(Book.genre == genre)
    if author_id:
        query = query.where(Book.author_id == author_id)
    return session.exec(query).all()


@router.get("/authors/{author_id}/books", response_model=list[Book])
def list_books_of_author(
    author_id: int, session: Session = Depends(get_session)
) -> List[Book]:
    if session.get(Author, author_id) is None:
        raise HTTPException(status_code=404, detail="Author not found")
    return session.exec(select(Book).where(Book.author_id == author_id)).all()


@router.get("/authors/{author_id}/books/{book_id}", response_model=Book)
def get_book(
    author_id: int, book_id: int, session: Session = Depends(get_session)
) -> Book:
    book = session.get(Book, book_id)
    if not book or book.author_id != author_id:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.post(
    "/authors/{author_id}/books",
    response_model=Book,
    status_code=status.HTTP_201_CREATED,
)
def add_book(
    author_id: int, book: Book, session: Session = Depends(get_session)
) -> Book:
    if session.get(Author, author_id) is None:
        raise HTTPException(status_code=404, detail="Author not found")
    assert_pages_positive(book.pages)
    assert_genre_valid(book.genre)

    book.author_id = author_id
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


@router.put("/authors/{author_id}/books/{book_id}", response_model=Book)
def update_book(
    author_id: int,
    book_id: int,
    book_data: Book,
    session: Session = Depends(get_session),
) -> Book:
    db_book = session.get(Book, book_id)
    if not db_book or db_book.author_id != author_id:
        raise HTTPException(status_code=404, detail="Book not found")
    assert_pages_positive(book_data.pages)

    book_data.id = book_id
    book_data.author_id = author_id
    session.merge(book_data)
    session.commit()
    return book_data


@router.delete(
    "/authors/{author_id}/books/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_book(
    author_id: int, book_id: int, session: Session = Depends(get_session)
) -> None:
    db_book = session.get(Book, book_id)
    if not db_book or db_book.author_id != author_id:
        raise HTTPException(status_code=404, detail="Book not found")
    session.delete(db_book)
    session.commit()
    return None


# ---------------------------------- EXTRA ROUTES ----------------------------------
@router.get("/genres", response_model=list[str])
def list_genres() -> list[str]:
    return [g.value for g in BookGenre]
