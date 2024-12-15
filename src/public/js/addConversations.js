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

        // clear the search form
        location.reload();
        searchInput.value="";
        // searchResults.style.display = 'none';
        searchResults.innerHTML = '';

      } catch (error) {
        console.error('Error creating or fetching conversation:', error);

        // clear the search form
        searchInput.value="";
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
      }
    }
  });

});
