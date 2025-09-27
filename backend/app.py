from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from config import Config

if os.path.exists(".env.development") and not os.getenv("PRODUCTION"):
    origins = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
    ]
else:
    origins = [
        Config.DEPLOYED_FRONTEND_URL] if Config.DEPLOYED_FRONTEND_URL else []


app: FastAPI = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
