document.addEventListener('DOMContentLoaded', function () {
  const userTypeToggle = document.getElementById('userTypeToggle');
  const extraFieldsContainer = document.getElementById('extraFieldsContainer');
  const switchElement = document.querySelector('.switch');

  userTypeToggle.addEventListener('change', function () {
    var link = document.querySelector("link[href='signup.css']");

    if (userTypeToggle.checked) {
      switchElement.classList.remove('switch-left');
      switchElement.classList.add('switch-right');
      extraFieldsContainer.style.display = 'block'; // Show the extraFieldsContainer
    } else {
      switchElement.classList.remove('switch-right');
      switchElement.classList.add('switch-left');
      extraFieldsContainer.style.display = 'none'; // Hide the extraFieldsContainer
    }
  });

  const study_yearSlider = document.getElementById('study_year');
  const study_yearValue = document.querySelector('.slider-value');

  study_yearSlider.addEventListener('input', function () {
    study_yearValue.textContent = 'Anno di Studio: ' + this.value;
  });

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

    if (userTypeToggle.checked) {
      userType = 'student';
      const gender = document.getElementById('gender').value;
      const study_course = document.getElementById('study_course').value;
      const study_year = document.getElementById('study_year').value;

      // Genera l'email dinamicamente
      email = `${name.toLowerCase()}.${surname.toLowerCase()}@student.unisurvey`;

      // Genera lo student_id sequenziale
      const student_id = await generatestudent_id();

      // Effettua il resto delle operazioni per la registrazione dello studente
      try {
        const response = await axios.post('/api/students/signup', {
          name,
          surname,
          password,
          email,
          gender,
          study_course,
          study_year,
          student_id,
        });

        if (response.status === 200) {
          // Registrazione avvenuta con successo, esegui azioni desiderate o reindirizza a un'altra pagina
          alert('Registrazione studente avvenuta con successo!');
          window.location.href = 'http://localhost:3000/Home/';
        } else {
          // La registrazione è fallita, visualizza un messaggio di errore
          alert('Registrazione studente fallita. Si prega di riprovare.');
        }
      } catch (error) {
        console.log('Errore:', error);
        // Gestisci altri tipi di errori, come problemi di rete o errori del server
        alert('Errore del server');
      }
    } else {
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
});

function resetForm() {
  document.getElementById('signupForm').reset();
  document.getElementById('study_year').value = 1;
  document.querySelector('.slider-value').textContent = 'Anno di Studio: 1';
}

function generatestudent_id() {
  return new Promise((resolve, reject) => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Ottieni la sequenza progressiva per lo studente dal backend
    axios.get('/api/students/sequenceNumber')
      .then(response => {
        let sequenceNumber = response.data.sequenceNumber || 1;
        sequenceNumber = parseInt(sequenceNumber);

        // Aggiorna la sequenza progressiva nel backend
        axios.put('/api/students/sequenceNumber', { sequenceNumber: sequenceNumber + 1 })
          .then(() => {
            // Genera il numero di matricola con le prime cifre dell'anno in corso e la sequenza progressiva
            const student_id = currentYear.toString().slice(-2) + sequenceNumber.toString().padStart(4, '0');
            resolve(student_id);
          })
          .catch(error => reject(error));
      })
      .catch(error => reject(error));
  });
}
 