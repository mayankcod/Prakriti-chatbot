import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def start_server():
    print("Starting the SDG Career Bot server...")
    
    # Check if uvicorn is installed
    try:
        import uvicorn
        print("✅ Uvicorn is installed")
    except ImportError:
        print("❌ Uvicorn is not installed. Installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "uvicorn"])
        print("✅ Uvicorn installed successfully")
    
    # Check if other dependencies are installed
    try:
        from fastapi import FastAPI
        print("✅ FastAPI is installed")
    except ImportError:
        print("❌ FastAPI is not installed. Installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi"])
        print("✅ FastAPI installed successfully")
    
    try:
        from openai import OpenAI
        print("✅ OpenAI is installed")
    except ImportError:
        print("❌ OpenAI is not installed. Installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "openai"])
        print("✅ OpenAI installed successfully")
    
    try:
        import python_dotenv
        print("✅ python-dotenv is installed")
    except ImportError:
        print("❌ python-dotenv is not installed. Installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "python-dotenv"])
        print("✅ python-dotenv installed successfully")
    
    # Start the server in a new process
    print("\n🚀 Starting the FastAPI server...")
    server_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for the server to start
    print("⏳ Waiting for server to start...")
    time.sleep(2)
    
    # Open the HTML file in the default browser
    html_path = Path("index.html").absolute().as_uri()
    print(f"📂 Opening {html_path} in your browser...")
    webbrowser.open(html_path)
    
    print("\n✨ Server is running! Press Ctrl+C to stop.")
    
    try:
        # Print server output
        while True:
            output = server_process.stdout.readline()
            if output:
                print(output.strip())
            
            error = server_process.stderr.readline()
            if error:
                print(f"Error: {error.strip()}", file=sys.stderr)
            
            # Check if the process is still running
            if server_process.poll() is not None:
                print("❌ Server stopped unexpectedly")
                break
                
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        server_process.terminate()
        print("Server stopped.")

if __name__ == "__main__":
    start_server()