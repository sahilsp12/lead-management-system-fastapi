from fastapi import FastAPI

app = FastAPI(
    title="Lead Management System API",
    version="1.0.0",
    description="Backend Assessment using FastAPI"
)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Lead Management System API is running 🚀"
    }