import React from 'react';
import './SurveyInterface.css'; // File CSS esterno per gli stili aggiuntivi

class SurveyInterface extends React.Component {
  render() {
    return (
      <div className="survey-container">
        <h1>Survey</h1>
        <button className="survey-button">Sondaggio 1</button>
        <button className="survey-button">Sondaggio 2</button>
        <button className="survey-button">Sondaggio 3</button>
        <button className="survey-button">Sondaggio 4</button>
        <button className="command-button">Indietro</button>
        <button className="command-button">Fine</button>
      </div>
    );
  }
}

export default SurveyInterface;