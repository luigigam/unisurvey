document.addEventListener("DOMContentLoaded", function() {
    const surveyList = document.getElementById("surveyList");
    const addSurveyForm = document.getElementById("addSurveyForm");

    // Funzione per visualizzare i sondaggi dal database
    function displaySurveys(surveys) {
        surveyList.innerHTML = ""; // Cancella la lista dei sondaggi

        surveys.forEach(function(survey) {
            const surveyRow = document.createElement("div");
            surveyRow.innerHTML = survey.title + " | " + survey.link;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Rimuovi";
            deleteButton.addEventListener("click", function() {
                removeSurvey(survey._id);
            });

            surveyRow.appendChild(deleteButton);
            surveyList.appendChild(surveyRow);
        });
    }

    // Funzione per aggiungere un nuovo sondaggio al database
    function addSurvey(title, link) {
        fetch("/api/surveys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: title, link: link })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Sondaggio aggiunto:", data);
            getSurveys(); // Aggiorna la lista dei sondaggi
        })
        .catch(error => {
            console.error("Errore durante l'aggiunta del sondaggio:", error);
        });
    }

    // Funzione per rimuovere un sondaggio dal database
    function removeSurvey(surveyId) {
        fetch("/api/surveys/" + surveyId, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {
            console.log("Sondaggio rimosso:", data);
            getSurveys(); // Aggiorna la lista dei sondaggi
        })
        .catch(error => {
            console.error("Errore durante la rimozione del sondaggio:", error);
        });
    }

    // Funzione per ottenere i sondaggi dal database
    function getSurveys() {
        fetch("/api/surveys")
        .then(response => response.json())
        .then(data => {
            displaySurveys(data);
        })
        .catch(error => {
            console.error("Errore durante il recupero dei sondaggi:", error);
        });
    }

    // Aggiungi un gestore di eventi per l'invio del modulo di aggiunta del sondaggio
    addSurveyForm.addEventListener("submit", function(event) {
        event.preventDefault(); // Evita l'invio del modulo

        const surveyTitle = document.getElementById("surveyTitle").value;
        const surveyLink = document.getElementById("surveyLink").value;

        addSurvey(surveyTitle, surveyLink);

        addSurveyForm.reset();
    });

    // Ottieni i sondaggi dal database all'avvio
    getSurveys();
});

