// Funzione per eseguire una richiesta GET e visualizzare tutti gli studenti
function getStudents() {
    axios.get('http://localhost:3000/api/admins/studentManager/getstudents')
      .then(response => {
        const studentsList = document.getElementById('studentsList');
        studentsList.innerHTML = '';
        response.data.forEach(student => {
          const studentItem = document.createElement('div');
          studentItem.innerHTML = `ID: ${student.id}, Nome: ${student.name}, Età: ${student.age}`;
          studentsList.appendChild(studentItem);
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  // Funzione per eseguire una richiesta PUT e aggiornare le informazioni di uno studente specifico
  function updateStudent() {
    const studentId = document.getElementById('studentIdInput').value;
    const studentName = document.getElementById('studentNameInput').value;
    const studentAge = document.getElementById('studentAgeInput').value;
  
    const requestData = {
      name: studentName,
      age: studentAge
    };
  
    axios.put(`http://localhost:3000/api/admins/studentManager/getstudents/${studentId}`, requestData)
      .then(response => {
        // Visualizza il messaggio di successo o errore
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  // Funzione per eseguire una richiesta DELETE e eliminare uno studente specifico
  function deleteStudent() {
    const studentId = document.getElementById('deleteStudentIdInput').value;
  
    axios.delete(`http://localhost:3000/api/admins/studentManager/deletestudent/${studentId}`)
      .then(response => {
        // Visualizza il messaggio di successo o errore
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }
  
  // Funzione per eseguire una richiesta GET e visualizzare tutti gli admin
function getAdmins() {
    axios.get('http://localhost:3000/api/admins/getall')
      .then(response => {
        const adminsList = document.getElementByname('adminsList');
        adminsList.innerHTML = '';
        response.data.forEach(admin => {
          const adminItem = document.createElement('div');
          adminItem.innerHTML = `Nome: ${admin.name}, Età: ${admin.age}`;
          adminsList.appendChild(adminItem);
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
  
// Funzione per eseguire una richiesta POST e aggiungere un nuovo admin
function addAdmin() {
    const newAdminName = document.getElementById('newAdminNameInput').value;
  
    const requestData = {
      name: newAdminName,
    };
  
    axios.post('http://localhost:3000/api/admins/updateAdmin', requestData)
      .then(response => {
        // Visualizza il messaggio di successo o errore
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }
  
// Funzione per eseguire una richiesta DELETE e rimuovere un admin
function removeAdmin() {
    const adminName = document.getElementById('removeAdminNameInput').value;
  
    axios.delete(`http://localhost:3000/api/admins/deleteadmin/${adminName}`)
      .then(response => {
        // Visualizza il messaggio di successo o errore
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }
  