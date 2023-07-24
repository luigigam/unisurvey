let loginApiEndpoint, errorMessage;

async function loginUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
//check tipologia

  if (username.endsWith("@student.unisurvey")) {
    loginApiEndpoint = '/api/student/login';
  } else if (username.endsWith("@admin.unisurvey")) {
    loginApiEndpoint = '/api/admin/login';
  } else {
    errorMessage = 'Login fallito,se non si utilizza una mail @type.unisurvey,si prega di registrarsi con nuovo profilo.';
  }

  try {
    const response = await fetch(loginApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.status === 200) {
      if (username.endsWith("@student.unisurvey")) {
        window.location.href = "http://localhost:3000/Home";
      } else if (username.endsWith("@admin.unisurvey")) {
        window.location.href = "http://localhost:3000/Home/AHome.html";
      }
    } else if (response.status === 400) {
      const data = await response.json();
      errorMessage = data.error;
    } else {
      errorMessage = 'Server Error';
    }
  } catch (error) {
    console.log('Error:', error);
    errorMessage = 'Server Error';
  }

  //gestione errori 
  if (errorMessage === 'invalid-email') {
    alert('Invalid Email. Please enter a valid email address.');
  } else if (errorMessage === 'Not allowed') {
    alert('Invalid Password. Please enter a valid password.');
  } else if (errorMessage) {
    alert(errorMessage);
  }
}

// Gestione bottone Login
document.addEventListener("DOMContentLoaded", function() {
  const loginButton = document.getElementById("button");
  if (loginButton) {
    loginButton.addEventListener("click", function(e) {
      e.preventDefault();
      loginUser();
    });
  }

  // Gestione Resetpasswd
  const resetPasswordLink = document.getElementById("reset-password-link");
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "resetpassw.html";
    });
  }

  // EGEstione Registrati
  const Register = document.getElementById("Register");
  if (Register) {
    Register.addEventListener("click", function(e) {
      e.preventDefault();
      window.location.href = "../Signup";
    });
  }
});
