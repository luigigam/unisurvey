document.getElementById('button').addEventListener('click', async function (e) {
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
      // Genera l'email dinamicamente
      email = `${name.toLowerCase()}.${surname.toLowerCase()}@admin.unisurvey`;
  
      // Effettua il resto delle operazioni per la registrazione dell'amministratore
      try {
        const response = await axios.post('/api/admins/signup', {
          name,
          surname,
          password,
          email,
        });
  
        if (response.status === 200) {
          // Registrazione avvenuta con successo, esegui azioni desiderate o reindirizza a un'altra pagina
          alert('Registrazione amministratore avvenuta con successo!');
          window.location.href = 'http://localhost:3000/Home/AHome.html';
        } else {
          // La registrazione è fallita, visualizza un messaggio di errore
          alert('Registrazione amministratore fallita. Si prega di riprovare.');
        }
      } catch (error) {
        console.log('Errore:', error);
        // Gestisci altri tipi di errori, come problemi di rete o errori del server
        alert('Errore del server');
      }
    }
  
    resetForm();
  });
  
  function resetForm() {
    document.getElementById('signupForm').reset();
  }
  