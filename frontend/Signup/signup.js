document.getElementById('button').addEventListener('click', async () => {
    const nome = document.getElementById('nome').value;
    const cognome = document.getElementById('cognome').value;
    const genere = document.getElementById('genere').value;
    const password = document.getElementById('password').value;
  
    const email = `${nome}.${cognome}@unisurvey.lf`;
  
    try {
      const response = await axios.post('/api/students/signup', {
        nome,
        cognome,
        genere,
        email,
        password
      });
  
      if (response.status === 200) {
        // Registrazione avvenuta con successo, esegui azioni desiderate o reindirizza a un'altra pagina
        window.location.href = 'http://localhost:3000/Home/home.html';
      } else {
        // La registrazione è fallita, visualizza un messaggio di errore
        let errorMessage = 'Registrazione fallita. Si prega di riprovare.';
  
        if (response.data && response.data.state) {
          errorMessage = response.data.state;
        }
  
        // Visualizza un avviso in base al messaggio di errore
        if (errorMessage === 'invalid-nome') {
          alert('Nome non valido. Si prega di inserire un nome valido.');
        } else if (errorMessage === 'invalid-cognome') {
          alert('Cognome non valido. Si prega di inserire un cognome valido.');
        } else if (errorMessage === 'invalid-genere') {
          alert('Genere non valido. Si prega di inserire un genere valido.');
        } else if (errorMessage === 'invalid-email') {
          alert('Email non valida. Si prega di inserire un indirizzo email valido.');
        } else if (errorMessage === 'invalid-password') {
          alert('Password non valida. Si prega di inserire una password valida.');
        } else {
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.log('Errore:', error);
      // Gestisci altri tipi di errori, come problemi di rete o errori del server
      alert('Errore del server');
    }
  });
  