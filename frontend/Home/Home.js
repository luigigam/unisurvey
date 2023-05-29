document.getElementById("themeSwitch").addEventListener("change", function() {
    document.body.classList.toggle("dark-theme");
  });
  
  function filterEvents(value) {
    // Recupera la data odierna con:
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // Calcola in base alla selezione che data limite mettere
    const limitDate = new Date();
    switch (value) {
      case "today":
        limitDate.setDate(today.getDate() + 1);
        break;
      case "1week":
        limitDate.setDate(today.getDate() + 7);
        break;
      case "2weeks":
        limitDate.setDate(today.getDate() + 14);
        break;
      case "1month":
        limitDate.setMonth(today.getMonth() + 1);
        break;
      default:
        limitDate.setDate(today.getDate() + 1);
        break;
    }
    limitDate.setHours(0, 0, 0, 0);
  
    // Effettua la chiamata al backend per recuperare gli eventi
    fetch("")
      .then((response) => response.json())
      .then((data) => {
        // Filtra gli eventi in base alle date
        const filteredEvents = data.filter((event) => {
          const eventDate = new Date(event.start);
          return eventDate >= today && eventDate < limitDate;
        });
  
        // Mostra gli eventi sulla pagina
        displayEvents(filteredEvents);
      })
      .catch((error) => console.log(error));
  }
  
  function displayEvents(events) {
    const eventsContainer = document.getElementById("events");
    eventsContainer.innerHTML = "";
  
    if (events.length === 0) {
      const noEventsMessage = document.createElement("p");
      noEventsMessage.textContent = "Nessun evento trovato.";
      eventsContainer.appendChild(noEventsMessage);
    } else {
      events.forEach((event) => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");
  
        const eventName = document.createElement("h3");
        eventName.textContent = event.summary;
  
        const eventDate = document.createElement("p");
        eventDate.textContent = formatDate(event.start);
  
        const eventDescription = document.createElement("p");
        eventDescription.textContent = event.description;
  
        eventDiv.appendChild(eventName);
        eventDiv.appendChild(eventDate);
        eventDiv.appendChild(eventDescription);
  
        eventsContainer.appendChild(eventDiv);
      });
    }
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("it-IT", options);
  }