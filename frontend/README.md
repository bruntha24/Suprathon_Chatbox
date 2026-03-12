Install Required Packages

Inside backend folder

pip install fastapi uvicorn sentence-transformers faiss-cpu numpy rapidfuzz pydantic python-multipart

You will see something like:

Loading embedding model...
Creating embeddings...
FAISS index ready. 


⚠️ About the Warning
Warning: You are sending unauthenticated requests to the HF Hub

This is not an error. It just means HuggingFace is downloading the model without login.

You can ignore it.

To use npm run dev:

2️⃣ If you really want npm run dev

Create a package.json inside backend folder.

Step 1

Inside backend run:

npm init -y
Step 2

Edit package.json

{
  "name": "suprathon-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "uvicorn main:app --reload"
  }
}
Step 3:

Now you can run:

npm run dev

It will start:

uvicorn main:app --reload