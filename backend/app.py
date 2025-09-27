from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

if os.path.exists(".env.development") and not os.getenv("PRODUCTION"):
    origins = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",
    ]
else:
    origins = [
        "https://stirring-genie-9833a8.netlify.app"
    ]


app: FastAPI = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
