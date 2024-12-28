const form = document.querySelector('#chat-form');
const messageContainer = document.querySelector('#chat-message-list');
const chatTitleContainer = document.querySelector('#conversation-partner');
const loggedinUserId = '<%= user.id %>';
const loggedinUserName = '<%= user.username %>';
let participant = null; // selected conversation participant object
let current_conversation_id; // selected conversation id

// socket initialization
const socket = io('<%= process.env.APP_URL %>');

// handle new/live incoming message from socket
socket.on("new_message", data => {
  // only respond if current conversation is open in any client
  if (data.message.conversation_id == current_conversation_id) {
    // message class
    const messageClass = data.message.sender.id === loggedinUserId ? 'you-message' : 'other-message';

    const senderAvatar = data.message.sender.avatar ? `<img src="./uploads/avatars/${data.message.sender.avatar}" alt="${data.message.sender.name}" />` : `<img src="./images/nophoto.png" alt="${data.message.sender.name}" />`;

    // message attachments
    let attachments = '<div class="attachments">';

    if (data.message.attachment && data.message.attachment.length > 0) {
      data.message.attachment.forEach(attachment => {
        attachments += `<img src="./uploads/attachments/${attachment}" /> `;
      });
    }

    attachments += '</div>';

    let messageHTML;

    // do not show avatar for loggedin user
    if (data.message.sender.id == loggedinUserId) {
      messageHTML = `<div class="message-row ${messageClass}"><div class="message-content">
              <div class="message-text">${data.message.message}</div>
              ${attachments}
              <div class="message-time">${moment(data.message.date_time).fromNow()}</div>
            </div></div>`;
    } else {
      messageHTML = `<div class="message-row ${messageClass}"><div class="message-content">
              ${senderAvatar}
              <div class="message-text">${data.message.message}</div>
              ${attachments}
              <div class="message-time">${moment(data.message.date_time).fromNow()}</div>
            </div></div>`;
    }

    // append the inoming message to message area as last item
    document.querySelector('#chat-message-list > .message-row:first-child').insertAdjacentHTML('beforeBegin', messageHTML);
  }
});

// get messages of a conversation
async function getMessages(conversation_id, current_conversation_name) {

  // messages failure toast
  const messagesFailureToast = Toastify({
    text: "Error loading messages!",
    duration: 1000,
  });

  let response = await fetch(`/inbox/messages/${conversation_id}`);
  const result = await response.json();

  if (!result.errors && result.data) {
    form.style.visibility = 'visible';

    const { data, user, conversation_id } = result;

    participant = data.participant;
    current_conversation_id = conversation_id;

    if (data.messages) {

      let allMessages = '';

      if (data.messages.length > 0) {
        data.messages.forEach((message) => {
          let senderAvatar = message.sender.avatar ? `./uploads/avatars/${message.sender.avatar}` : './images/nophoto.png';
          const messageClass = message.sender.id === loggedinUserId ? 'you-message' : 'other-message';
          const showAvatar = message.sender.id === loggedinUserId ? '' : `<img src="${senderAvatar}" alt="${message.sender.name}" />`;

          // message attachments
          let attachments = '<div class="attachments">';

          if (message.attachment && message.attachment.length > 0) {
            message.attachment.forEach(attachment => {
              attachments += `<img src="./uploads/attachments/${attachment}" /> `;
            });
          }

          attachments += '</div>';

          // final message html
          let messageHTML = `<div class="message-row ${messageClass}"><div class="message-content">
                      ${showAvatar}
                      <div class="message-text">${message.text}</div>
                      ${attachments}
                      <div class="message-time">${moment(message.date_time).fromNow()}</div>
                    </div></div>`;

          allMessages += messageHTML;
          messageContainer.innerHTML = allMessages;
        });
      } else if (data.messages.length === 0) {
        messageContainer.innerHTML = '<div class="message-row"></div>';
      }

      chatTitleContainer.textContent = current_conversation_name;
    }
  } else {
    messagesFailureToast.showToast();
  }
}

// message sending
form.onsubmit = async function (event) {
  event.preventDefault();

  const sendMessageFailureToast = Toastify({
    text: "Error sending message",
    duration: 1000,
  });

  // prepare the form data
  const formData = new FormData(form);
  formData.append('receiverId', participant.id);
  formData.append('receiverName', participant.name);
  formData.append('avatar', participant.avatar || '');
  formData.append('conversationId', current_conversation_id);

  // send the request to server
  let response = await fetch("/inbox/message", {
    method: "POST",
    body: formData,
  });

  // get response
  let result = await response.json();

  if (!result.errors) {
    form.reset(); // reset the form
  } else {
    sendMessageFailureToast.showToast();
  }
}