# Authors & Books

Simple web app:  
* **Frontend** – pure HTML/CSS/vanilla JS  
* **Backend** – FastAPI + SQLModel (SQLite)

## Setup

```bash
git clone https://github.com/CacaoCoder/authors-books-app.git
cd authors-books-app

python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
uvicorn backend.main:app --reload
```
Now open http://127.0.0.1:8000/index.html in your browser.
