document.addEventListener("DOMContentLoaded", () => {

  const searchResults = document.querySelector('#search-results');

  // Listen for clicks on search results
  searchResults.addEventListener('click', async (event) => {
    const target = event.target.closest('.searchResultUser');

    if (!target) return;

    // Get the user ID from a data attribute
    const selectedUserId = target.dataset.userId;
    console.log("get clicked to search" + " " + selectedUserId);
    if (selectedUserId) {
      try {
        // Send a POST request to create or fetch the conversation
        const response = await fetch('/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: selectedUserId }),
        });


      } catch (error) {
        console.error('Error creating or fetching conversation:', error);
      }
    }
  });

});
