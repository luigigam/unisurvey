document.addEventListener("DOMContentLoaded", () => {
    const createEventForm = document.getElementById("createEventForm");
    const eventList = document.getElementById("eventList");
  
    // Function to fetch events and update the event list
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/events/getevents");
        const events = response.data;
  
        // Clear the event list
        eventList.innerHTML = "";
  
        // Display each event in the list
        events.forEach(event => {
          const li = document.createElement("li");
          li.textContent = event.summary;
          eventList.appendChild(li);
        });
      } catch (error) {
        console.error(error);
      }
    };
  
    // Function to create a new event
    const createEvent = async (summary, location, start, end, description) => {
      try {
        await axios.post("http://localhost:3000/api/events", {
          summary,
          location,
          start,
          end,
          description
        });
  
        // Fetch and update the event list
        await fetchEvents();
      } catch (error) {
        console.error(error);
      }
    };
  
    // Event listener for the create event form submission
    createEventForm.addEventListener("submit", event => {
      event.preventDefault();
  
      const summary = document.getElementById("summary").value;
      const location = document.getElementById("location").value;
      const start = document.getElementById("start").value;
      const end = document.getElementById("end").value;
      const description = document.getElementById("description").value;
  
      createEvent(summary, location, start, end, description);
    });
  
    // Fetch events on page load
    fetchEvents();
  });
  