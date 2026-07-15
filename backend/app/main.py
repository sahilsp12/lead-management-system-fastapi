from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine

app = FastAPI(
    title="Lead Management System API",
    version="1.0.0"
)


@app.get("/")
def root():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "success": True,
            "message": "Database Connected Successfully ✅"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }