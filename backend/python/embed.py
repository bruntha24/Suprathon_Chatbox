import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

with open("python/data.json", "r") as f:
    data = json.load(f)

questions = [item["question"] for item in data]

embeddings = model.encode(questions)

dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np.array(embeddings))

faiss.write_index(index, "python/faiss_index.index")

print("Embeddings created successfully!")
