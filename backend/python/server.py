# server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from query import get_answer  # your Python chatbot logic

app = FastAPI()

# Allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")   # ⚡ Make this match your React POST
def chat_endpoint(req: ChatRequest):
    try:
        reply = get_answer(req.message)
        return {"reply": reply}
    except Exception as e:
        print("ERROR:", e)
        return {"reply": "Server error occurred. Please try again."}
