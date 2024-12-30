const form = document.querySelector('#chat-form');
const messageContainer = document.querySelector('#chat-message-list');
const chatTitleContainer = document.querySelector('#conversation-partner');
const loggedinUserId = '<%= user.id %>';
const loggedinUserName = '<%= user.username %>';
let otherParticipant = null; // Selected conversation participant object
let current_conversation_id; // Selected conversation id

// Initialize socket connection
const socket = io('<%= process.env.APP_URL %>');

// Handle new/live incoming message from socket
socket.on("new_message", (data) => {
  if (data.message.conversation === current_conversation_id) {
    const messageClass = data.message.sender._id === loggedinUserId ? 'you-message' : 'other-message';
    const senderAvatar = data.message.sender.avatar
      ? `<img src="./uploads/avatars/${data.message.sender.avatar}" alt="${data.message.sender.username}" />`
      : `<img src="./images/nophoto.png" alt="${data.message.sender.username}" />`;

    let attachments = '<div class="attachments">';
    if (data.message.attachment) {
      attachments += `<img src="./uploads/attachments/${data.message.attachment}" />`;
    }
    attachments += '</div>';

    const messageHTML = data.message.sender._id === loggedinUserId
      ? `<div class="message-row ${messageClass}"><div class="message-content">
              <div class="message-text">${data.message.content}</div>
              ${attachments}
              <div class="message-time">${moment(data.message.sentAt).fromNow()}</div>
          </div></div>`
      : `<div class="message-row ${messageClass}"><div class="message-content">
              ${senderAvatar}
              <div class="message-text">${data.message.content}</div>
              ${attachments}
              <div class="message-time">${moment(data.message.sentAt).fromNow()}</div>
          </div></div>`;

    document.querySelector('#chat-message-list > .message-row:first-child').insertAdjacentHTML('beforeBegin', messageHTML);
  }
});

// Fetch messages of a conversation
async function getMessages(conversation_id, current_conversation_name) {
  

  let response = await fetch(`/inbox/messages/${conversation_id}`);
  const result = await response.json();

  
  if (!result.errors && result.data) {
    // form.style.visibility = 'visible';

    
    const { messages, participant } = result.data;
    otherParticipant = participant;
    current_conversation_id = conversation_id;
    
    if (messages) {
      let allMessages = '';
      messages.forEach((message) => {
        const senderAvatar = message.sender.avatar
          ? `${message.sender.avatar}`
          : './images/user1.png';

        const messageClass = message.sender._id === loggedinUserId ? 'you-message' : 'other-message';
        console.log(loggedinUserName);

        const showAvatar = message.sender._id === loggedinUserId ? '' : `<img src="${senderAvatar}" alt="${message.sender.username}" />`;

        // let attachments = '<div class="attachments">';
        // if (message.attachment) {
        //   attachments += `<img src="./uploads/attachments/${message.attachment}" />`;
        // }
        // attachments += '</div>';

        const messageHTML = `<div class="message-row ${messageClass}"><div class="message-content">
                      ${showAvatar}
                      <div class="message-text">${message.content}</div>
                      
                      <div class="message-time">${message.sentAt}</div>
                  </div></div>`;

        allMessages += messageHTML;
      });

      messageContainer.innerHTML = allMessages;
    } else {
      messageContainer.innerHTML = '<div class="message-row">No messages yet.</div>';
    }

    
    chatTitleContainer.textContent = current_conversation_name;
  }
}

// Handle message sending
form.onsubmit = async function (event) {
  event.preventDefault();

  

  const formData = new FormData(form);
  formData.append('receiverId', otherParticipant._id);
  formData.append('conversationId', current_conversation_id);

  
  let response = await fetch("/inbox/message", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'  // Add this header
    },
    body: JSON.stringify({
      conversationId: current_conversation_id,  // Make sure this exists
      content: formData.get('message'),  // Get message content from form
    })
  });

  const result = await response.json();
  console.log(result);
  if (!result.errors) {
    form.reset();
  } 
};
