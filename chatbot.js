const log = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const btn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const glass = document.querySelector('.glass');
let hasExpanded = false;

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

let isRecording = false;

// Expand UI once
function expandChatUI() {
if (!hasExpanded) {
  document.querySelector('.glass').classList.add('expanded');
  document.body.classList.add('chat-fullscreen');
  hasExpanded = true;
}

}

// Function to add messages to chat log
function addMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
  messageDiv.textContent = text;
  log.appendChild(messageDiv);
  log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
}

// Function to handle API errors
function handleError(error) {
  console.error('API Error:', error);
  if (error.message && error.message.includes('Failed to fetch')) {
    addMessage('bot', "Sorry, I couldn't connect to the server. Please make sure the backend is running.");
  } else {
    addMessage('bot', 'Sorry, I encountered an error: ' + error.message);
  }
}

// Function to send message to backend
async function sendMessage(text) {
  if (!text) return;

  expandChatUI(); // ✅ Expand the UI once on first input

  if (text.toLowerCase() === 'clear') {
    log.innerHTML = '';
    input.value = '';
    addMessage('bot', 'Chat cleared. How can I help you now?');
    return;
  }

  addMessage('user', text);
  input.value = '';

  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'bot-message';
  thinkingMsg.innerHTML = `<span class="typing"><span>.</span><span>.</span><span>.</span></span>`;
  log.appendChild(thinkingMsg);
  log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://prakriti-chatbot.onrender.com/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Unknown server error';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (
      data.reply.toLowerCase().includes("i don't know") ||
      data.reply.toLowerCase().includes("not sure") ||
      data.reply.trim().length < 5
    ) {
      thinkingMsg.textContent = "I'm still learning. Could you try asking in another way?";
    } else {
      thinkingMsg.textContent = ` ${data.reply}`;
    }

  } catch (error) {
    log.removeChild(thinkingMsg);
    handleError(error);
  }
}

// Event listeners
btn.addEventListener('click', () => {
  sendMessage(input.value.trim());
  input.value = '';
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage(input.value.trim());
    input.value = '';
  }
});

// Speech Recognition
micBtn.addEventListener('click', () => {
  if (!isRecording) {
    recognition.start();
    isRecording = true;
    micBtn.textContent = "🔴 Recording...";
  } else {
    recognition.stop();
    isRecording = false;
    micBtn.textContent = "🎤";
  }
});

recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript;
  console.log("You said:", transcript);
  input.value = transcript;
  sendMessage(transcript); // ✅ trigger message and expansion
};

recognition.onerror = function (event) {
  console.error('Speech recognition error:', event.error);
  addMessage('bot', 'Sorry, I couldn\'t hear you properly. Can you try again?');
};

// Optional: Text-to-speech
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
  addMessage('bot', text);
}
function triggerWelcomeTransition() {
  if (hasInteracted) return;
  hasInteracted = true;

  const title = document.getElementById('title');
  const splineBg = document.getElementById('spline-bg');
  const glass = document.getElementById('glass');

  // Fade out the title and spline background
  title.classList.add('fade-out');
  subtitle.classList.add('fade-out');
  splineBg.classList.add('fade-out');

  // Expand the chat container
  setTimeout(() => {
    glass.classList.add('expanded');
  }, 500); // Delay expansion slightly for smoother transition
}

// Hook into send
btn.addEventListener('click', () => {
  triggerWelcomeTransition();
});

// Hook into Enter key
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    triggerWelcomeTransition();
  }
  
});

 //Trigger animation when ANY button is clicked
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', triggerWelcomeTransition);
});

window.addEventListener("load", async () => {
  const statusEl = document.getElementById("server-status");
  statusEl.style.display = "block";

  const backendUrl = "https://prakriti-chatbot.onrender.com"; 

  try {
    // Ping backend to wake it up
    await fetch(backendUrl, { method: "GET" });
    // Backend is awake now
  } catch (err) {
    console.log("Initial ping failed. Might be cold starting...");
  }

  // Wait 2–3 seconds to make animation feel natural
  setTimeout(() => {
    statusEl.style.display = "none";
  }, 2500);
});

// Initial welcome message
addMessage('bot', 'Hello! I\'m Prakriti. How can I help you today?');

function toggleFullscreen() {
  const glass = document.querySelector('.glass');
  const btn = document.getElementById('fullscreen-toggle');
  const body = document.body;

  const isExpanded = glass.classList.contains('expanded');

  if (isExpanded) {
    glass.classList.remove('expanded');
    body.classList.remove('chat-fullscreen');
    btn.textContent = '⛶'; // expand icon
  } else {
    glass.classList.add('expanded');
    body.classList.add('chat-fullscreen');
    btn.textContent = '✖'; // close icon
  }
}
