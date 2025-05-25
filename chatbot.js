const log = document.getElementById('chat-log');
const input = document.getElementById('user-input');
const btn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';
recognition.interimResults = true;
recognition.maxAlternatives = 1;

let isRecording = false;

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

  if (text.toLowerCase() === 'clear') {
    log.innerHTML = ''; // Clear the chat log
    input.value = ''; // Clear the input box
    addMessage('bot', 'Chat cleared. How can I help you now?');
    return;
  }

  addMessage('user', text);
  input.value = ''; // Clear input after sending




  // Add "Thinking..." animation
  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'bot-message';
  thinkingMsg.innerHTML = `<span class="typing"><span>.</span><span>.</span><span>.</span></span>`;
  log.appendChild(thinkingMsg);
  log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://prakriti-chatbot.onrender.com', {
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

    // Simple fallback: If the reply is too short or says "I don't know"
    if (
      data.reply.toLowerCase().includes("i don't know") ||
      data.reply.toLowerCase().includes("not sure") ||
      data.reply.trim().length < 5
    ) {
      thinkingMsg.textContent = "I'm still learning. Could you try asking in another way?";
    } else {
      thinkingMsg.textContent = ` ${data.reply}`;
    }
    
    //speakText(data.reply); // You can leave this commented out for now
    
    //speakText(data.reply); // Speak the bot's response

  } catch (error) {
    log.removeChild(thinkingMsg);
    handleError(error);
  }
}

// Event listeners
btn.addEventListener('click', () => {
  sendMessage(input.value.trim());
  input.value = ''; // Clear input after sending
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // optional, prevents form submission or unwanted behavior
    sendMessage(input.value.trim());
    input.value = ''; // ✅ Clear input after sending
  }
});


// Speech Recognition - Start listening when mic button is clicked
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

// Handle speech results and display them in the input field
recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript;
  console.log("You said:", transcript);
  input.value = transcript; // Set the transcript as input value
};

// Handle any errors that occur during speech recognition
recognition.onerror = function (event) {
  console.error('Speech recognition error:', event.error);
  addMessage('bot', 'Sorry, I couldn\'t hear you properly. Can you try again?');
};

// Text-to-speech (SpeechSynthesis) function
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
  addMessage('bot', text); // Display the spoken text in chat
}

// Initial welcome message
addMessage('bot', 'Hello! I\'m Prakriti. How can I help you today?');
