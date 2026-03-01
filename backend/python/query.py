import sys
import json
import os
import re
from rapidfuzz import fuzz, process
import io

# =====================================================
# ✅ FIX WINDOWS UNICODE ERROR
# =====================================================
try:
    sys.stdout.reconfigure(encoding='utf-8')
except AttributeError:
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# =====================================================
# ✅ LOAD Q&A JSON
# =====================================================
script_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(script_dir, "data.json")

with open(data_path, "r", encoding="utf-8") as f:
    qa_data = json.load(f)

# =====================================================
# ✅ GET USER INPUT
# =====================================================
user_input = " ".join(sys.argv[1:]).lower().strip()

# =====================================================
# ✅ SPELLING NORMALIZATION
# =====================================================
spelling_map = {
    "organised": "organized",
    "organisation": "organization",
    "programme": "program",
    "favourite": "favorite",
    "colour": "color",
    "cancelled": "canceled",
    "centre": "center",
    "price": "prize",
    "reward": "prize",
    "winnings": "prize",
    "who r u": "who are you",
    "who ru": "who are you",
    "who are u": "who are you",
    "who r you": "who are you",
    "how r u": "how are you",
    "how r you": "how are you",
    "ur": "your",
    "certificte": "certificate",
    "internaship": "internship",
    "plagirism": "plagiarism",
    "plagarism": "plagiarism",
    "plagriasm": "plagiarism",
    "judging": "judge",
    "judges": "judge",
    "judgement": "judge",
    "douts": "doubt",
    "dout": "doubt",
    "doubts": "doubt",
    "tq": "thank you",
    "ok tq": "thank you",
    "thx": "thank you",
    "thank u": "thank you"
}

def normalize_spelling(text):
    for wrong, correct in spelling_map.items():
        text = re.sub(rf'\b{re.escape(wrong)}\b', correct, text)
    return text

user_input = normalize_spelling(user_input)

# =====================================================
# ✅ KEYWORD MAP
# =====================================================
keyword_map = {
    "prize": ["prize"],
    "certificate": ["certificate"],
    "register": ["register", "registration", "signup", "join", "link", "url", "website","apply"],
    "deadline": ["deadline", "last date"],
    "contact": ["contact", "doubt", "query", "support", "help", "clarify", "phone", "assist", "guidance", "issue", "problem"],
    "organize": ["organized", "conducted", "hosted"],
    "judge": ["judge", "jury", "panel", "judging", "evaluation"],
    "mentor": ["mentor"],
    "team": ["team", "members", "team size"],
    "domain": ["domain", "field", "category", "technology"],
    "fee": ["fee", "free", "price", "cost"],
    "internship": ["internship", "job", "placement"],
    "result": ["result", "winner"],
    "online": ["online", "offline", "mode"],
    "submission": ["submission", "submit", "requirements"],
    "plagiarism": ["plagiarism", "copy", "cheating"],
    "about_bot": ["who are you", "bot", "chatbot", "about bot", "what is your name", "who am i talking to"],
    "user_name_query": ["what is my name", "do you know my name", "who am i"],
    "suprathon": ["suprathon", "suprathon 2025", "suprathon 2.0", "suprathon updates", "latest on suprathon"],
    "user_name_query": ["what is my name", "do you know my name", "who am i", "tell my name",
    "whats my name",
    "what's my name"]
}

all_keywords = list(set([kw for kws in keyword_map.values() for kw in kws]))

# =====================================================
# ✅ AUTOCORRECT
# =====================================================
def autocorrect_text(text):
    words = text.split()
    corrected_words = []

    for word in words:
        best_match = process.extractOne(word, all_keywords, scorer=fuzz.ratio)
        if best_match and best_match[1] >= 75:
            corrected_words.append(best_match[0])
        else:
            corrected_words.append(word)

    return " ".join(corrected_words)

user_input = autocorrect_text(user_input)

# =====================================================
# ✅ SPLIT QUESTIONS
# =====================================================
questions = re.split(r'[?.;]\s*|\sand\s|,', user_input)
questions = [q.strip() for q in questions if q.strip()]

# =====================================================
# ✅ SMALL TALK / CASUAL CHAT
# =====================================================
small_talk_patterns = {
    "greeting": ["hi", "hello", "hey", "hii", "heyy", "hola"],
    "how_are_you": ["how are you", "how r you", "how's it going"],
    "thanks": ["thank you", "thanks", "thankyou", "tq", "thanks a lot", "thx", "thank you so much", "thank u"],
    "bye": ["bye", "goodbye", "see you", "cya"],
    "positive": ["ok", "okay", "good", "nice", "cool", "great", "awesome"],
    "bot_praise": ["good bot", "nice bot", "you are good", "well done"],
    "casual_help": ["what can you do", "help me", "i need help"],
    "intro": ["who are you", "what are you"]
}

small_talk_responses = {
    "greeting": "Hello 👋 I'm your SuPrathon Assistant! How can I help you today?",
    "how_are_you": "I'm doing great 😊 Thanks for asking! How can I help you with SuPrathon?",
    "thanks": "You're welcome 😊 Happy to help!",
    "bye": "Goodbye 👋 See you soon and all the best for SuPrathon!",
    "positive": "Glad to hear that 😄 How can I assist you further?",
    "bot_praise": "Thank you so much 😎 That means a lot!",
    "casual_help": "Sure! You can ask me about registration, prizes, deadlines, team size, certificates, domains, judges, internships, or SuPrathon updates.",
    "intro": "I'm a SuPrathon chatbot designed to answer all your questions about SuPrathon 2025 and 2.0."
}

def handle_small_talk(text):
    text = text.lower().strip()
    for category, patterns in small_talk_patterns.items():
        for p in patterns:
            if re.search(rf'\b{re.escape(p)}\b', text):
                return small_talk_responses.get(category)
    return None

# =====================================================
# ✅ USER NAME MEMORY
# =====================================================
user_name = None

user_name = None  # memory for user name

def check_for_user_name(text):
    global user_name
    patterns = [
        r"\bi am ([A-Za-z]+)\b",
        r"\bmy name is ([A-Za-z]+)\b",
        r"\bi'?m ([A-Za-z]+)\b"
    ]
    for pat in patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            user_name = match.group(1).capitalize()
            return True
    return False

def handle_user_name_query(text):
    global user_name
    if any(kw in text.lower() for kw in keyword_map["user_name_query"]):
        if user_name:
            return [f"Nice to meet you, {user_name}! 😊"]
        else:
            return ["I don't know your name yet. What's your name?"]
    return None
qa_data.append({
    "question": "SuPrathon info",
    "answer": "SuPrathon 2025 (also known as SuPrathon 2.0) is a national-level virtual hackathon for students, technologists, freelancers, and professionals. You can participate by registering at https://suprathon.suprazotech.in and following the instructions.",
    "keywords": ["suprathon"]
})
def handle_user_name_query(text):
    global user_name
    if any(kw in text.lower() for kw in keyword_map.get("user_name_query", [])):
        if user_name:
            return f"Your name is {user_name} 🙂"
        else:
            return "I don't know your name yet. What's your name?"
    return None

# =====================================================
# ✅ GET KEYWORD ANSWERS
# =====================================================
def get_all_keyword_answers(text):
    matched_answers = []
    text_norm = text.lower()

    for category, kw_list in keyword_map.items():
        if any(kw in text_norm for kw in kw_list):
            for item in qa_data:
                if any(kw in item.get("question","").lower() or kw in item.get("answer","").lower() for kw in kw_list):
                    if item["answer"] not in matched_answers:
                        matched_answers.append(item["answer"])
    return matched_answers if matched_answers else None

# =====================================================
# ✅ PROCESS QUESTIONS
# =====================================================
all_merged_answers = []

for question in questions:
    # 1️⃣ Check if user introduces their name
    name_reply = check_for_user_name(question)
    if name_reply:
        all_merged_answers.append(name_reply)
        continue

    # 2️⃣ Check if user asks about their name
    user_name_reply = handle_user_name_query(question)
    if user_name_reply:
        all_merged_answers.append(user_name_reply)
        continue

    # 3️⃣ Check small talk first
    small_reply = handle_small_talk(question)
    if small_reply:
        all_merged_answers.append(small_reply)
        continue

    # 4️⃣ Check keyword answers
    ans_list = get_all_keyword_answers(question)
    if ans_list:
        all_merged_answers.extend(ans_list)
    else:
        all_merged_answers.append(
            "I'm not sure about that 🤔 Please ask about registration, prizes, deadlines, team size, certificates, domains, judges, internships, or SuPrathon updates."
        )

# =====================================================
# ✅ MERGE ANSWERS
# =====================================================
final_answer = " ".join(all_merged_answers)

# =====================================================
# ✅ PRINT FINAL ANSWER
# =====================================================
print(final_answer)