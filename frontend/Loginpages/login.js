async function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post('/api/students/login', {
      email: username,
      password: password
    });

    if (response.status === 200) {
      // Login successful, check if the user is an admin
      if (response.data && response.data.isAdmin) {
        // Admin user, redirect to admin home page
        window.location.href = "http://localhost:3000/Home/AHome.html";
      } else {
        // Student user, redirect to student home page
        window.location.href = "http://localhost:3000/Home/home.html";
      }
    } else {
      // Login failed, display error message
      let errorMessage = 'Login failed. Please try again.';

      if (response.data && response.data.state) {
        errorMessage = response.data.state;
      }

      // Display pop-up alert based on error message
      if (errorMessage === 'invalid-email') {
        alert('Invalid Email. Please enter a valid email address.');
      } else if (errorMessage === 'Not allowed') {
        alert('Invalid Password. Please enter a valid password.');
      } else {
        alert(errorMessage);
      }
    }
  } catch (error) {
    console.log('Error:', error);
    // Handle other errors, such as network issues or server errors
    alert('Server Error');
  }
}

// Event listener for the login button
document.addEventListener("DOMContentLoaded", function() {
  const loginButton = document.getElementById("button");
  if (loginButton) {
    loginButton.addEventListener("click", function(e) {
      e.preventDefault();
      loginUser();
    });
  }

  // Event listener for the password reset link
  const resetPasswordLink = document.getElementById("reset-password-link");
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "resetpassw.html";
    });
  }

  const Register = document.getElementById("Register");
  if (Register) {
    Register.addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "../Signup/register.html";
    });
  }
});
