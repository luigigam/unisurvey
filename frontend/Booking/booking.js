// Function to fetch classrooms from the backend API
async function getClassrooms() {
  try {
    const response = await fetch('api/classrooms/getclassrooms');
    if (!response.ok) {
      throw new Error('Failed to fetch classrooms');
    }
    const classrooms = await response.json();
    return classrooms;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Function to render classrooms on the screen
function renderClassrooms(classrooms) {
  const classroomsContainer = document.getElementById('classrooms');

  // Clear previous content
  classroomsContainer.innerHTML = '';

  // Render each classroom
  classrooms.forEach(classroom => {
    const classroomElement = document.createElement('div');
    classroomElement.innerHTML = `
      <h3>${classroom.code}</h3>
      <p>Seats: ${classroom.seats}</p>
      <p>Available: ${classroom.available ? 'Yes' : 'No'}</p>
    `;
    classroomsContainer.appendChild(classroomElement);
  });
}

// Function to check availability and make a booking
async function bookClassroom(classroomCode, date, time) {
  try {
    const response = await fetch('/classrooms/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        classroomCode,
        date,
        time
      })
    });
    if (!response.ok) {
      throw new Error('Failed to book classroom');
    }
    const bookingResult = await response.json();
    return bookingResult;
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred while booking the classroom' };
  }
}

// Function to handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const classroomSelect = document.getElementById('classroom');
  const dateInput = document.getElementById('date');
  const timeSelect = document.getElementById('time');

  const classroomCode = classroomSelect.value;
  const date = dateInput.value;
  const time = timeSelect.value;

  const bookingResult = await bookClassroom(classroomCode, date, time);

  if (bookingResult.success) {
    alert('Classroom booked successfully!');
  } else {
    alert('Failed to book classroom: ' + bookingResult.message);
  }
}

// Function to initialize the page
async function initializePage() {
  const classrooms = await getClassrooms();
  renderClassrooms(classrooms);

  const bookingForm = document.getElementById('bookingForm');
  bookingForm.addEventListener('submit', handleFormSubmit);
}

// Call the initializePage function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

