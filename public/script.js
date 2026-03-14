document.addEventListener("DOMContentLoaded", () => {
  const conversation = [];
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function renderMarkdown(markdownText) {
    const rawHTML = marked.parse(markdownText);
    return DOMPurify.sanitize(rawHTML);
  }

  function createMessage(content, role, isHTML = false) {
    const wrapper = document.createElement("div");

    wrapper.className = role === "user" ? "flex justify-end mb-3" : "flex justify-start mb-3";

    const bubble = document.createElement("div");

    bubble.className = role === "user" ? "bg-blue-500 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]" : "bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]";

    if (isHTML) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }

    wrapper.appendChild(bubble);
    chatBox.appendChild(wrapper);

    scrollToBottom();

    return bubble;
  }

  function createTypingIndicator() {
    const typingHTML = `
      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;

    return createMessage(typingHTML, "bot", true);
  }

  async function sendMessage(message) {
    conversation.push({ role: "user", text: message });

    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation: conversation,
      }),
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    return data.result;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = input.value.trim();

    if (!message) return;

    createMessage(message, "user");

    input.value = "";

    // tampilkan animasi loading
    const typingBubble = createTypingIndicator();

    try {
      const aiReply = await sendMessage(message);

      if (aiReply) {
        typingBubble.innerHTML = renderMarkdown(aiReply);
        conversation.push({ role: "model", text: aiReply });
      } else {
        typingBubble.textContent = "Sorry, no response received.";
      }
    } catch (error) {
      console.error(error);
      typingBubble.textContent = "Failed to get response from server.";
    }

    scrollToBottom();
  });
});
