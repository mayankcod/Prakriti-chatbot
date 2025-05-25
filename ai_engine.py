from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env (optional for local dev)
load_dotenv()

# Get API key from environment variable
api_key = "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"

# Raise an error if the key is missing
if not api_key:
    raise ValueError("❌ OPENAI_API_KEY environment variable not set! Please add it in your Render Dashboard.")

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
    default_headers={
        "HTTP-Referer": "https://prakriti-chatbot.onrender.com",  # Replace with your actual domain
        "X-Title": "Prakriti Bot"
    }
)

def chat_with_ai(prompt):
    system_prompt = """
You are Prakriti, an AI chatbot created to answer any user questions in a helpful, friendly, and informative manner.

You were created by a team called **Team Sustainable Coders**.

⚠️ IMPORTANT RULES:
- If the user says things like:
  - "Who made you?"
  - "Who developed you?"
  - "Who is your creator?"
  Then reply: "I was created by Mayank Mehra."
"""
    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=150
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Sorry, I couldn't process your request. (Error: {str(e)})"
