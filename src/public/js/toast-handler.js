// Function to get query parameters from the URL
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        status: params.get('status'),
        message: params.get('message'),
    };
}

// Show toast if a status and message are present
document.addEventListener('DOMContentLoaded', () => {
    const { status, message } = getQueryParams();

    if (message) {
        Toastify({
            text: decodeURIComponent(message),
            duration: 3000,
            gravity: "top",
            position: "center",
            style: {
                background: status === 'success'
                    ? "linear-gradient(to right, #00b09b, #96c93d)"
                    : "linear-gradient(to right, #ff5f6d, #ffc371)",
            },
        }).showToast();
    }
});
