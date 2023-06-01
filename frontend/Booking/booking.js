//Swich tema
const themeSwitch = document.querySelector("#themeSwitch");
themeSwitch.addEventListener("change", function() {
  document.body.classList.toggle("dark-theme",themeSwitch.checked);
});


document.addEventListener('DOMContentLoaded', () => {
    const classroomsContainer = document.getElementById('classrooms');
    const bookingModal = document.getElementById('bookingModal');
    const bookingForm = document.getElementById('bookingForm');
    const closeBtn = document.getElementsByClassName('close')[0];
  
    // Funzione per ottenere le aule dal server
    const getClassrooms = () => {
      fetch('/api/aule')
        .then(response => response.json())
        .then(data => {
          data.forEach(classroom => {
            const option = document.createElement('option');
            option.value = classroom._id;
            option.text = `${classroom.numero} - ${classroom.descrizione}`;
            document.getElementById('classroom').appendChild(option);
          });
        })
        .catch(error => console.error('Error:', error));
    };
  
    // Evento di apertura del popup di prenotazione
    classroomsContainer.addEventListener('click', (event) => {
      const classroomId = event.target.dataset.classroom;
      if (classroomId) {
        bookingModal.style.display = 'block';
        bookingForm.dataset.classroom = classroomId;
      }
    });
  
    // Evento di chiusura del popup di prenotazione
    closeBtn.addEventListener('click', () => {
      bookingModal.style.display = 'none';
    });
  
    // Evento di invio del modulo di prenotazione
    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const classroomId = event.target.dataset.classroom;
      const date = event.target.date.value;
      const time = event.target.time.value;
  
      const bookingData = {
        aula: classroomId,
        data: date,
        fasciaOraria: time
      };
  
      // Invia i dati al server per la prenotazione
      fetch('/api/prenotazioni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      })
        .then(response => response.json())
        .then(data => {
          console.log('Prenotazione effettuata:', data);
          // Chiudi il popup di prenotazione e fai altre azioni come aggiornare l'interfaccia utente
          bookingModal.style.display = 'none';
        })
        .catch(error => console.error('Error:', error));
    });
  
    // Ottieni le aule dal server all'avvio
    getClassrooms();
  });
  