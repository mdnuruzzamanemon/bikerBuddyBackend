// Global variables
let activeConversationId = null; // Track the currently active conversation
const loggedInUserId = document.getElementById('logged-in-user').getAttribute('data-user-id');

const socket = io(); // Initialize WebSocket connection

// Fetch and update the conversation list
async function fetchConversations() {
  try {
    const response = await fetch('/conversations'); // Fetch from backend API
    const conversations = await response.json();

    // Update conversation list in the DOM
    const conversationList = document.getElementById('conversation-list');
    conversationList.innerHTML = ''; // Clear existing content

    conversations.forEach((conversation) => {
      const activeClass = conversation._id === activeConversationId ? 'active' : '';
      const lastMessage = conversation.messages[0]?.content || 'No messages yet';

      conversationList.innerHTML += `
        <div class="conversation ${activeClass}" data-id="${conversation._id}">
          <img src="./images/user1.png" alt="${conversation.participants[0].username}" />
          <div class="title-text">${conversation.participants[0].username}</div>
          <div class="created-date">${new Date(conversation.lastModified).toLocaleDateString()}</div>
          <div class="conversation-message">${lastMessage}</div>
        </div>
      `;
    });
    console.log("value updated");
  } catch (error) {
    console.error('Error fetching conversations:', error);
  }
}

// Fetch messages for a conversation
async function fetchMessages(conversationId) {
  try {
    const response = await fetch(`/messages/${conversationId}`);
    const messages = await response.json();

    const messageList = document.getElementById('chat-message-list');
    messageList.innerHTML = ''; // Clear existing messages

    messages.forEach((message) => {
      const messageClass = message.sender._id === loggedInUserId ? 'you-message' : 'other-message';

      messageList.innerHTML += `
        <div class="message-row ${messageClass}">
          <div class="message-content">
            <img src="./images/user1.png" alt="${message.sender.username}" />
            <div class="message-text">${message.content}</div>
            <div class="message-time">${new Date(message.sentAt).toLocaleTimeString()}</div>
          </div>
        </div>
      `;
    });

    // Scroll to the latest message
    messageList.scrollTop = messageList.scrollHeight;
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

// Event listener for selecting a conversation
document.getElementById('conversation-list').addEventListener('click', (e) => {
  const conversationElement = e.target.closest('.conversation');
  if (!conversationElement) return;

  activeConversationId = conversationElement.dataset.id;
  fetchMessages(activeConversationId); // Fetch messages for the selected conversation
});

// Handle chat form submission
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const content = input.value.trim();

  if (!content || !activeConversationId) return;

  try {
    // Send the message to the server
    const response = await fetch('/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: activeConversationId,
        senderId: loggedInUserId,
        content,
      }),
    });

    if (!response.ok) throw new Error('Failed to send message');

    const newMessage = await response.json();

    // Clear the input field
    input.value = '';

    // Emit a new message event for real-time updates
    socket.emit('newMessage', { conversationId: activeConversationId, message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
  }
});

// Listen for updates on conversations
socket.on('updateConversation', (updatedConversation) => {
  const conversationElement = document.querySelector(`.conversation[data-id="${updatedConversation._id}"]`);
  if (conversationElement) {
    // Update the conversation message preview
    conversationElement.querySelector('.conversation-message').textContent = updatedConversation.messages[0]?.content || 'No messages yet';
  } else {
    // If the conversation doesn't exist in the list, re-fetch all conversations
    fetchConversations();
  }
});

// Listen for new messages
socket.on('newMessage', ({ conversationId, message }) => {
  if (conversationId === activeConversationId) {
    // Add the new message to the message list
    const messageList = document.getElementById('chat-message-list');
    const messageClass = message.sender._id === loggedInUserId ? 'you-message' : 'other-message';

    messageList.innerHTML += `
      <div class="message-row ${messageClass}">
        <div class="message-content">
          <img src="./images/user1.png" alt="User" />
          <div class="message-text">${message.content}</div>
          <div class="message-time">${new Date(message.sentAt).toLocaleTimeString()}</div>
        </div>
      </div>
    `;

    // Scroll to the latest message
    messageList.scrollTop = messageList.scrollHeight;
  }
});

// Add or update a conversation from search results
document.addEventListener("DOMContentLoaded", () => {
  const searchResults = document.querySelector('#search-results');
  const searchInput = document.getElementById('search-input');

  // Listen for clicks on search results
  searchResults.addEventListener('click', async (event) => {
    const target = event.target.closest('.searchResultUser');

    if (!target) return;

    // Get the user ID from a data attribute
    const selectedUserId = target.dataset.userId;
    if (selectedUserId) {
      try {
        // Send a POST request to create or fetch the conversation
        const response = await fetch('/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: selectedUserId }),
        });

        
        // Clear the search form
        searchInput.value = "";
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';

        // Fetch updated conversations
        fetchConversations();
      } catch (error) {
        console.error('Error creating or fetching conversation:', error);

        // Clear the search form
        searchInput.value = "";
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
      }
    }
  });
});

// Initial data fetch
fetchConversations();
