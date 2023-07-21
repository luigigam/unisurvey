
const study_yearSlider = document.getElementById('study_year');
const study_yearValue = document.querySelector('.slider-value');
const userTypeToggle = document.getElementById('userTypeToggle');

study_yearSlider.addEventListener('input', function () {
  study_yearValue.textContent = 'Anno di Studio: ' + this.value;
});

async function handleRegistration() {
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
    let counter = 0;
    do {
      if (counter > 0) {
        email = `${name.toLowerCase()}.${surname.toLowerCase()}${counter}@student.unisurvey`;
      } else {
        email = `${name.toLowerCase()}.${surname.toLowerCase()}@student.unisurvey`;
      }
      counter++;
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

        if (response.status === 201) {
          // Registrazione avvenuta con successo, esegui azioni desiderate o reindirizza a un'altra pagina
          alert('Registrazione studente avvenuta con successo!');
          window.location.href = 'http://localhost:3000/Home/';
        } else if (response.status === 409) {
          // Email duplicata, riprova con una nuova email
          continue;
        } else {
          // La registrazione è fallita, visualizza un messaggio di errore
          alert('Registrazione studente fallita. Si prega di riprovare.');
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
}

document.getElementById('button').addEventListener('click', function (e) {
  e.preventDefault();
  handleRegistration();
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
    axios
      .get('/api/students/sequenceNumber')
      .then((response) => {
        let sequenceNumber = response.data.sequenceNumber || 1;
        sequenceNumber = parseInt(sequenceNumber);

        // Aggiorna la sequenza progressiva nel backend
        axios
          .put('/api/students/sequenceNumber', { sequenceNumber: sequenceNumber + 1 })
          .then(() => {
            // Genera il numero di matricola con le prime cifre dell'anno in corso e la sequenza progressiva
            const student_id =
              currentYear.toString().slice(-2) + sequenceNumber.toString().padStart(4, '0');
            resolve(student_id);
          })
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
  });
}
