const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  // Clear the input field
  input.value = "";

  // Show "Thinking..." message
  const thinkingMessage = appendMessage("bot", "Thinking..."); // Store the element

  // Send the user message to the backend
  fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      conversation: [{ role: "user", text: userMessage }],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.result) {
        removeThinkingMessage(thinkingMessage);
        appendMessage("bot", data.result); // Append bot's message
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      // Remove "Thinking..." message
      chatBox.removeChild(thinkingMessage);
      appendMessage("bot", "Failed to get response from server.");
    });
});

function removeThinkingMessage(thinkingMessage) {
  if (thinkingMessage && chatBox.contains(thinkingMessage)) {
    chatBox.removeChild(thinkingMessage);
  } else {
    console.warn("Thinking message not found in chat box or already removed.");
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  const html = marked.parse(text);
  msg.innerHTML = html;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

// Function to set the theme
function setTheme(theme) {
  if (theme === "dark") {
    body.classList.add("dark-mode");
    themeToggle.textContent = "Light Mode";
  } else {
    body.classList.remove("dark-mode");
    themeToggle.textContent = "Dark Mode";
  }
  localStorage.setItem("theme", theme); // Save the theme to localStorage
}

// Event listener for the theme toggle button
themeToggle.addEventListener("click", function () {
  if (body.classList.contains("dark-mode")) {
    setTheme("light");
  } else {
    setTheme("dark");
  }
});

// Get the saved theme from localStorage
const savedTheme = localStorage.getItem("theme");

// Set the theme on initial load
if (savedTheme) {
  setTheme(savedTheme);
} else {
  setTheme("light"); // Default to light mode
}
