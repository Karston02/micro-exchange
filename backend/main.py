from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import exchange_router

# create the app
app = FastAPI()

# set up CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# configure middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(exchange_router)

@app.get("/health")
def health():
    return {"status": "ok"}
