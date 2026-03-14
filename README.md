# SuPrathon Chatbox

This project is a full-stack chatbot application featuring a **React/Vite frontend** and a **FastAPI backend** (backed by FAISS for document indexing and retrieval).

## 📁 Project Structure

- `frontend/`: Contains the React web application built with Vite, TypeScript, and Tailwind CSS.
- `backend/`: Contains the FastAPI python server, FAISS vector index, and the core chatbot logic.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended) for the frontend.
- **Python** (v3.8 or higher recommended) for the backend.
- **npm**, **yarn**, or **bun** (package managers for JS).

---

## 🚀 Getting Started

### 1. Backend Setup

The backend handles chat requests, embeddings generation, and vector search using `sentence-transformers` and `faiss-cpu`.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (Optional but Recommended):**
   ```bash
   python -m venv venv
   
   # Activate on Mac/Linux:
   source venv/bin/activate  
   # Activate on Windows:
   # venv\Scripts\activate
   ```

3. **Install the required dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   *(This installs `fastapi`, `uvicorn`, `sentence-transformers`, `faiss-cpu`, `pydantic`, etc.)*

4. **Run the backend server:**
   
   You can run the server directly via `uvicorn`:
   ```bash
   uvicorn server:app --reload --host 127.0.0.1 --port 8000
   ```
   *Alternatively, using npm (since a package.json is provided):*
   ```bash
   npm run dev
   ```
   
   The API will now be running on [http://127.0.0.1:8000](http://127.0.0.1:8000). 
   You can check the health endpoint at [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health).

   **Note:** During the first run, HuggingFace will download the embedding model. You can safely ignore any "unauthenticated requests to HF Hub" warnings.

---

### 2. Frontend Setup

The frontend is a modern web application built with Vite, React, TypeScript, and Shadcn UI components.

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be accessible at [http://localhost:5173](http://localhost:5173).

---

## 📝 Running Both Components Concurrently

To run the whole stack during development, the simplest method is to open **two separate terminal windows**:

**Terminal 1 (Backend):**
```bash
cd backend
python -m venv venv        # If using virtual environment
source venv/bin/activate
uvicorn server:app --reload
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

## 🛠️ Tech Stack

**Frontend:**
- React (v18) + Vite
- TypeScript
- Tailwind CSS
- Shadcn UI (Radix UI)
- React Router DOM
- React Query

**Backend:**
- Python 3 & FastAPI
- Uvicorn (ASGI server)
- Sentence Transformers
- FAISS (Vector similarity search)
- NumPy & RapidFuzz
