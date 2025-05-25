from openai import OpenAI
import os
from dotenv import load_dotenv

# Initialize OpenRouter client
load_dotenv()
# Use the API key directly since it's already in the code
# In production, this should be stored in an environment variable
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",  # OpenRouter endpoint
    api_key=api_key,  # Your OpenRouter key
    default_headers={
        "HTTP-Referer": "http://localhost",  # Optional but recommended
        "X-Title": "Prakriti Bot"           # Identify your app
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
            model="mistralai/mistral-7b-instruct",  # Free model
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