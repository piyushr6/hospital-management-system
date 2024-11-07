document.querySelectorAll('.btn').forEach(button => {
   button.addEventListener('click', () => {
      // Construct the URL based on the button id
      let page = button.id + '.html'; // e.g., 'patient.html'
      window.location.href = page; // Navigate to the constructed URL
   });
});