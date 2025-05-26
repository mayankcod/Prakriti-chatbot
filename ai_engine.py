import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
print("🔐 Loaded API Key?", bool(api_key))

# Raise an error if the key is missing
if not api_key:
    raise ValueError("❌ OPENAI_API_KEY environment variable not set! Please add it in your Render Dashboard.")

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
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "X-Title": "Prakriti Bot",
            "Referer": "https://prakriti-chatbot-58si.vercel.app"
        }

        payload = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 150
        }

        response = httpx.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    except httpx.HTTPStatusError as e:
        return f"❌ HTTP Error {e.response.status_code}: {e.response.json().get('error', {}).get('message', 'No details')}"
    except Exception as e:
        return f"❌ Unexpected Error: {str(e)}"
