document.addEventListener("DOMContentLoaded", () => {
    const conversationList = document.getElementById("conversation-list");
    const chatTitle = document.getElementById("chat-title");
    const chatMessageList = document.getElementById("chat-message-list");
  
    // Fetch conversations and update the UI
    async function fetchConversations() {
      const response = await fetch("/api/conversations");
      const conversations = await response.json();
  
      // Update conversation list
      conversationList.innerHTML = conversations
        .map(
          (conversation) => `
          <div class="conversation ${conversation.isActive ? "active" : ""}" data-id="${conversation._id}">
            <img src="./images/user${conversation.participants[1]._id}.png" alt="${conversation.participants[1].username}" />
            <div class="title-text">${conversation.participants[1].username}</div>
            <div class="created-date">${new Date(conversation.lastModified).toLocaleDateString()}</div>
            <div class="conversation-message">${conversation.lastMessage || "No message"}</div>
          </div>`
        )
        .join("");
    }
  
    // Fetch messages for an active conversation
    async function fetchMessages(conversationId) {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const messages = await response.json();
  
      // Update chat title and message list
      chatTitle.innerHTML = `
        <span>${messages.participantUsername}</span>
        <img src="./images/trash.png" alt="Delete Conversation" class="deleteConversation" data-id="${conversationId}" />
      `;
  
      chatMessageList.innerHTML = messages.messages
        .reverse()
        .map((message) => {
          const isUserMessage = message.sender === loggedInUser._id;
          return `
            <div class="message-row ${isUserMessage ? "you-message" : "other-message"}">
              <div class="message-content">
                ${
                  !isUserMessage
                    ? `<img src="./images/user${message.sender}.png" alt="${message.senderUsername}" />`
                    : ""
                }
                <div class="message-text">${message.content}</div>
                <div class="message-time">${new Date(message.sentAt).toLocaleString()}</div>
              </div>
            </div>`;
        })
        .join("");
    }
  
    // Delete a conversation
    async function deleteConversation(conversationId) {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        await fetchConversations(); // Refresh conversation list
        chatTitle.innerHTML = ""; // Clear chat title
        chatMessageList.innerHTML = ""; // Clear message list
      } else {
        console.error("Failed to delete the conversation.");
      }
    }
  
    // Event: Click on a conversation
    conversationList.addEventListener("click", (e) => {
      const conversation = e.target.closest(".conversation");
      if (conversation) {
        const conversationId = conversation.dataset.id;
        fetchMessages(conversationId);
      }
    });
  
    // Event: Delete a conversation
    chatTitle.addEventListener("click", (e) => {
      if (e.target.classList.contains("deleteConversation")) {
        const conversationId = e.target.dataset.id;
        deleteConversation(conversationId);
      }
    });
  
    fetchConversations(); // Initial fetch
  });
  