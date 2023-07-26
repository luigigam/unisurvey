document.addEventListener("DOMContentLoaded", function() {
  const surveyList = document.getElementById("surveyList");

  // Function to generate the survey buttons
  function generateSurveyButtons(surveys) {
      surveys.forEach(survey => {
          const button = document.createElement("button");
          button.textContent = survey.title;
          button.addEventListener("click", () => {
              window.open(survey.link, "_blank");
          });

          surveyList.appendChild(button);
      });
  }

  // Fetch surveys from the API
  fetch("http://localhost:3000/api/survey")
      .then(response => response.json())
      .then(data => {
          generateSurveyButtons(data);
      })
      .catch(error => {
          console.error("Error retrieving surveys:", error);
      });
});
