import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App_Calendar.css';

const App = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleButtonClick = (buttonNumber) => {
    console.log(`Se hizo clic en el botón ${buttonNumber}`);
  };

  return (
    <div className="app-container">
      <h1>Calendario</h1>
      <div className="selected-date-container">
        <h2>Fecha seleccionada: {selectedDate ? selectedDate.toLocaleDateString() : 'Ninguna'}</h2>
        <div className="button-container">
          <button onClick={() => handleButtonClick(1)}>Botón 1</button>
          <button onClick={() => handleButtonClick(2)}>Botón 2</button>
          <button onClick={() => handleButtonClick(3)}>Botón 3</button>
          <button onClick={() => handleButtonClick(4)}>Botón 4</button>
        </div>
      </div>
      <div className="calendar-container">
        <Calendar onChange={handleDateChange} value={selectedDate} />
      </div>
    </div>
  );
};

export default App;
