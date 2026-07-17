from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text

from app.core.database import engine

from app.api.v1.auth import router as auth_router

from app.api.v1.users import router as users_router

from app.api.v1.leads import router as leads_router

from app.api.v1.dashboard import router as dashboard_router

app = FastAPI(

    title="Lead Management System API",

    version="1.0.0"

)

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)

app.include_router(auth_router, prefix="/api/v1")

app.include_router(users_router, prefix="/api/v1")

app.include_router(leads_router, prefix="/api/v1")

app.include_router(dashboard_router, prefix="/api/v1")

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

