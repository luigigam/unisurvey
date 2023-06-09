// Funzione per reindirizzare l'utente a un'altra pagina
function reindirizzaAPagina(urlPagina) {
    window.location.href = urlPagina;
  }
  
  // Funzione per reindirizzare l'utente a una API esterna
  function reindirizzaAPI(urlAPI) {
    window.open(urlAPI, "_blank");
  }
  
  // Assegna gli eventi di click ai pulsanti
  document.addEventListener("DOMContentLoaded", function() {
    var addButton = document.getElementById("addButton");
    var infoButton = document.getElementById("infoButton");
    var checkButton = document.getElementById("checkButton");
    var createButton = document.getElementById("createButton");
  
    addButton.addEventListener("click", function() {
      reindirizzaAPagina("sondaggio1.html"); // Sostituisci "sondaggio1.html" con l'URL della pagina a cui desideri reindirizzare l'utente
    });
  
    infoButton.addEventListener("click", function() {
      reindirizzaAPagina("sondaggio2.html"); // Sostituisci "sondaggio2.html" con l'URL della pagina a cui desideri reindirizzare l'utente
    });
  
    checkButton.addEventListener("click", function() {
      reindirizzaAPagina("sondaggio3.html"); // Sostituisci "sondaggio3.html" con l'URL della pagina a cui desideri reindirizzare l'utente
    });
  
    createButton.addEventListener("click", function() {
      reindirizzaAPI("https://api.esempio.com"); // Sostituisci "https://api.esempio.com" con l'URL dell'API esterna a cui desideri reindirizzare l'utente
    });
  });