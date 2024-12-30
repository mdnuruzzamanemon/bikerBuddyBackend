// Function to show a custom toast
function showToast(message, type) {
    const toast = document.getElementById('custom-toast');
    toast.textContent = message; // Set the message content
    toast.className = type; // Add success or error class
    toast.style.display = 'block';

    // Hide the toast after 3 seconds
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // Capture the form submission event
  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default submission for demo purposes (remove this for real submission)

    const message = "<%- message %>"; // Use <%- %> to avoid escaping quotes
  const messageType = "<%- messageType %>"; // Avoid escaping

  // Display toast only if the message exists
  if (message) {
    showToast(message, messageType || 'success');
  }
  });