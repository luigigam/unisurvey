document.getElementById('button').addEventListener('click', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const surname = document.getElementById('surname').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm_password').value;

  if (password !== confirmPassword) {
    alert('Le password non corrispondono. Si prega di riprovare.');
    return;
  }

  let userType;
  let email;

  if (!userTypeToggle.checked) {
    userType = 'admin';
    
    let counter = 0;
    do {
      if (counter > 0) {
        email = `${name.toLowerCase()}.${surname.toLowerCase()}${counter}@admin.unisurvey`;
      } else {
        email = `${name.toLowerCase()}.${surname.toLowerCase()}@admin.unisurvey`;
      }
      counter++;
      try {
        const response = await axios.post('/api/admins/signup', {
          name,
          surname,
          password,
          email,
        });

        if (response.status === 201) {
          // Registrazione avvenuta con successo, esegui azioni desiderate o reindirizza a un'altra pagina
          alert('Registrazione amministratore avvenuta con successo!');
          window.location.href = 'http://localhost:3000/Home/AHome.html';
        } else if (response.status === 409) {
          // Email duplicata, riprova con una nuova email
          continue;
        } else {
          // La registrazione è fallita, visualizza un messaggio di errore
          alert('Registrazione amministratore fallita. Si prega di riprovare.');
        }
      } catch (error) {
        // Handle other types of errors, such as network problems or server errors
        if (error.response && error.response.status === 409) {
          // Email duplicata, riprova con una nuova email
          continue;
        } else {
          console.log('Errore:', error);
          alert('Errore del server');
          break;
        }
      }
    } while (true);
  }

  resetForm();
});

function resetForm() {
  document.getElementById('signupForm').reset();
}
