# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from query import get_answer

app = FastAPI(title="SuPrathon Chatbot API")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ChatRequest(BaseModel):
    message: str

# Chat endpoint
@app.post("/api/chat")
def chat_endpoint(req: ChatRequest):
    try:
        reply = get_answer(req.message)
        return {"reply": reply}
    except Exception as e:
        print("ERROR:", e)
        return {"reply": "Server error occurred. Please try again."}

# Health check
@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "SuPrathon Chatbot API is running!"}