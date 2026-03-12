# query.py
import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from rapidfuzz import fuzz
import re

# =====================================================
# File paths
# =====================================================
script_dir = os.path.dirname(os.path.abspath(__file__))
questions_file = os.path.join(script_dir, "questions.json")

# =====================================================
# Load questions data
# =====================================================
with open(questions_file, "r", encoding="utf-8") as f:
    data = json.load(f)

questions = [item["question"] for item in data]
answers = [item["answer"] for item in data]
keywords = [item["keywords"] for item in data]

# =====================================================
# Load embedding model (semantic search)
# =====================================================
model = None
index = None
try:
    print("Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("Creating embeddings...")
    question_embeddings = model.encode(questions, convert_to_numpy=True)
    dim = question_embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(question_embeddings))
    print("FAISS index ready.")
except Exception as e:
    print("Semantic search disabled:", e)

# =====================================================
# Helper function: clean text
# =====================================================
def clean_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    return text

# =====================================================
# Helper function: clean answer
# =====================================================
def clean_answer(text: str) -> str:
    lines = text.split("\n")
    lines = [line.strip() for line in lines if line.strip()]
    return "\n".join(lines)

# =====================================================
# Keyword scoring function
# =====================================================
STOPWORDS = {"who", "what", "when", "where", "is", "the", "a", "an", "can", "of", "from", "how"}

def keyword_score(query: str, kw_list: list) -> int:

    query_clean = clean_text(query)
    query_words = [w for w in query_clean.split() if w not in STOPWORDS]

    score = 0

    kw_list = sorted(kw_list, key=lambda x: -len(x))

    for kw in kw_list:

        kw_clean = clean_text(kw)
        kw_words = [w for w in kw_clean.split() if w not in STOPWORDS]

        # Exact phrase
        if kw_clean in query_clean:
            score += 15
            continue

        # All keyword words present
        if all(w in query_words for w in kw_words) and len(kw_words) > 0:
            score += 10
            continue

        # Partial match
        partial_score = sum(2 for w in kw_words if w in query_words)
        score += partial_score

        # Penalize short generic keywords
        if len(kw_clean) <= 4:
            score -= 3

    return score


# =====================================================
# Internal function to get single answer
# =====================================================
def get_single_answer(user_query: str):

    query_clean = clean_text(user_query)

    # -----------------------------
    # 1️⃣ Keyword Scoring
    # -----------------------------
    best_score = 0
    best_index = -1

    for i, kw_list in enumerate(keywords):

        score = keyword_score(user_query, kw_list)

        if score > best_score:
            best_score = score
            best_index = i

        elif score == best_score and best_index != -1:

            if sum(len(k) for k in kw_list) > sum(len(k) for k in keywords[best_index]):
                best_index = i

    if best_score > 0:
        return clean_answer(answers[best_index])

    # -----------------------------
    # 2️⃣ Fuzzy Matching
    # -----------------------------
    best_score = 0
    best_index = -1

    for i, q in enumerate(questions):

        q_clean = clean_text(q)

        score = fuzz.token_set_ratio(query_clean, q_clean)

        if score > best_score:
            best_score = score
            best_index = i

    if best_score >= 85:
        return clean_answer(answers[best_index])

    # -----------------------------
    # 3️⃣ Semantic Search
    # -----------------------------
    if model is not None and index is not None:

        try:

            query_embedding = model.encode([user_query], convert_to_numpy=True)

            D, I = index.search(np.array(query_embedding), 1)

            if D[0][0] < 1.0:
                return clean_answer(answers[I[0][0]])

        except Exception as e:
            print("Semantic search failed:", e)

    return None


# =====================================================
# Main function (MULTI QUESTION SUPPORT)
# =====================================================
def get_answer(user_query: str):

    # Split query into multiple parts
    parts = re.split(r"\band\b|,|\?|\balso\b|&", user_query, flags=re.IGNORECASE)

    parts = [p.strip() for p in parts if p.strip()]

    responses = []

    for part in parts:

        ans = get_single_answer(part)

        if ans and ans not in responses:
            responses.append(ans)

    if responses:
        return "\n\n".join(responses)

    return (
        "Oops! I couldn't find an exact answer.\n"
        "Please visit the official website for more information:\n"
        "https://suprathon.suprazotech.in"
    )


# =====================================================
# Chat loop
# =====================================================
if __name__ == "__main__":

    print("\nSuPrathon Bot ready! Type 'exit' to quit.\n")

    while True:

        user_input = input("Ask SuPrathon bot: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        response = get_answer(user_input)

        print("Bot:", response)