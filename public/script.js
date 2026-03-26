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
    const containerChat = document.createElement("div");
    const wrapper = document.createElement("div");
    const avatarImage = document.createElement("img");

    containerChat.className = role === "user" ? "flex justify-end w-full" : "flex justify-start w-full";
    avatarImage.className = "w-10 h-10 rounded-full";
    wrapper.className = role === "user" ? "flex flex-row-reverse justify-end mb-3 gap-2" : "flex flex-row justify-start mb-3 gap-2";

    avatarImage.src = role === "user" ? "/assets/img/avatar/user-no-bg.png" : "/assets/img/avatar/ai-no-bg.png";

    const bubble = document.createElement("div");

    bubble.className = role === "user" ? "bg-blue-500 text-white px-4 py-2 rounded-2xl shadow max-w-[70%]" : "bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[70%]";

    if (isHTML) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }
    wrapper.appendChild(avatarImage);
    wrapper.appendChild(bubble);

    containerChat.appendChild(wrapper);

    chatBox.appendChild(containerChat);

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
    try {
      conversation.push({ role: "user", text: message });

      const response = await fetch("api/chat", {
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
    } catch (error) {
      return false;
    }
  }

  async function sendMessageStream(message) {
    conversation.push({ role: "user", text: message });

    const typingBubble = createTypingIndicator();

    try {
      const response = await fetch("api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: conversation,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        lines.forEach((line) => {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "");

            const parsed = JSON.parse(data);
            if (parsed.error) {
              bubble.textContent = "⚠️ AI service error";
              return;
            }

            if (parsed.done) return;

            if (parsed.text) {
              aiText += parsed.text;

              typingBubble.innerHTML = renderMarkdown(aiText);
              scrollToBottom();
            }
          }
        });
      }

      conversation.push({ role: "model", text: aiText });
    } catch (error) {
      typingBubble.textContent = "Sorry, no response received.";
    }
  }

  async function handleMessage(message, mode) {
    if (mode === "stream") {
      await sendMessageStream(message);
    } else {
      // tampilkan animasi loading
      const typingBubble = createTypingIndicator();
      const aiReply = await sendMessage(message);

      if (aiReply) {
        typingBubble.innerHTML = renderMarkdown(aiReply);
        conversation.push({ role: "model", text: aiReply });
      } else {
        typingBubble.textContent = "Sorry, no response received.";
      }
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = input.value.trim();
    const mode = document.getElementById("mode-select").value;

    if (!message) return;

    createMessage(message, "user");

    input.value = "";

    try {
      await handleMessage(message, mode);
    } catch (error) {
      console.error(error);
      typingBubble.textContent = "Failed to get response from server.";
    }

    scrollToBottom();
  });
});
