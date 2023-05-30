async function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    // console.log(username);
    // console.log(password);

    try {
      const response = await fetch('backend\backend_testing\student_route.rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: username, password: password })
      });
  
      if (response.ok) {
        // Login successful, redirect to another page or perform desired actions
        window.location.href = 'home.html';
      } else {
        // Login failed, display error message
        let errorMessage = 'Login failed. Please try again.';
        
        try {
          const errorData = await response.json();
          console.log(errorData)
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (error) {
          console.log('Error parsing JSON:', error);
        }
  
        // Display pop-up alert based on error message
        if (errorMessage === 'Invalid Email') {
          alert('Invalid Email. Please enter a valid email address.');
        } else if (errorMessage === 'Invalid Password') {
          alert('Invalid Password. Please enter a valid password.');
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }
  
  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("button").addEventListener("click", function(e) {
      e.preventDefault();
      loginUser();
    });
  
    document.getElementById("reset-password-link").addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "resetpassw.html";
    });
  });
  