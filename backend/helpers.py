from datetime import date
from fastapi import HTTPException

from .models import BookGenre


def clean_birth_date(birth_date) -> date:
    if birth_date is None:
        raise HTTPException(422, "Birth date is required")
    
    if isinstance(birth_date, str):
        try:
            birth_date = date.fromisoformat(birth_date.strip())
        except ValueError:
            raise HTTPException(422, "Birth date must be YYYY‑MM‑DD")

    if birth_date > date.today():
        raise HTTPException(422, "Birth date cannot be in the future")

    return birth_date

def assert_pages_positive(pages: int) -> None:
    if not isinstance(pages, int):
        raise HTTPException(status_code=422, detail="Page count must be an integer")

    if pages <= 0:
        raise HTTPException(
            status_code=422, detail="Page count must be a positive integer"
        )
    
def assert_genre_valid(genre: str) -> None:
    if genre not in [g.value for g in BookGenre]:
        raise HTTPException(
            status_code=422, detail=f"Invalid genre: {genre}. Must be one of {[g.value for g in BookGenre]}"
        )
