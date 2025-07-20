from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .database import create_db_and_tables
from .routes import router

app = FastAPI(title="Authors & Books")


@app.on_event("startup")
def _startup() -> None:
    create_db_and_tables()


app.include_router(router)

frontend_dir = Path(__file__).resolve().parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
