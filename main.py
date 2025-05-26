from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ai_engine import chat_with_ai

app = FastAPI()  # 👈 THIS is what uvicorn needs

# Allow CORS (for frontend JS to access API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API is running"}

@app.post("/generate")
async def generate_response(data: dict):
    try:
        prompt = data.get("prompt")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required.")

        reply = chat_with_ai(prompt)
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
