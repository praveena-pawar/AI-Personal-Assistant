from flask import Flask, render_template, request, jsonify
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not found in .env")

client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
)

MODEL_NAME = "llama-3.1-8b-instant"

# Chat history shown in sidebar
chat_history = []

# Conversation memory sent to the LLM
conversation = [
    {
        "role": "system",
        "content": (
            "You are a helpful AI Personal Assistant. "
            "Give accurate, concise, and friendly answers."
        )
    }
]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():

    question = request.form.get("question", "").strip()

    if not question:
        return jsonify({"error": "Please enter a question."}), 400

    try:

        # Add user's question to conversation memory
        conversation.append({
            "role": "user",
            "content": question
        })

        # Ask Groq
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=conversation,
            temperature=0.7,
            max_tokens=512
        )

        answer = response.choices[0].message.content

        # Store assistant reply
        conversation.append({
            "role": "assistant",
            "content": answer
        })

        # Store sidebar history
        chat_history.append({
            "id": len(chat_history),
            "question": question,
            "answer": answer
        })

        return jsonify({
            "response": answer,
            "history": chat_history
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/summarize", methods=["POST"])
def summarize():

    email = request.form.get("email", "").strip()

    if not email:
        return jsonify({"error": "Please paste an email."}), 400

    prompt = f"""
Summarize the following email in 2-3 concise sentences.

Email:

{email}
"""

    try:

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert email summarizer."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=300
        )

        summary = response.choices[0].message.content

        return jsonify({
            "response": summary
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route("/history")
def history():
    return jsonify(chat_history)


@app.route("/clear-history", methods=["POST"])
def clear_history():

    # Clear sidebar history
    chat_history.clear()

    # Reset conversation memory
    conversation.clear()

    conversation.append({
        "role": "system",
        "content": (
            "You are a helpful AI Personal Assistant. "
            "Give accurate, concise, and friendly answers."
        )
    })

    return jsonify({
        "success": True
    })


if __name__ == "__main__":
    app.run(debug=True)