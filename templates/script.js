// Initialize all maps
function initMap(elementId, coords = [12.9716, 77.5946], zoom = 12) {
  if (!document.getElementById(elementId)) return;
  
  const map = L.map(elementId).setView(coords, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  
  return map;
}

// Search location function
function searchLocation() {
  const searchInput = document.getElementById('mapSearch') || 
                     document.getElementById('crimeSearch');
  const query = searchInput.value.trim();
  
  if (!query) {
    alert("Please enter a location");
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',')[0];
        
        // Update map if exists
        const mapElements = ['crimeMap', 'crimeHeatmap', 'liveMap'];
        mapElements.forEach(element => {
          const mapElement = document.getElementById(element);
          if (mapElement) {
            mapElement.innerHTML = ''; // Clear previous map
            const map = initMap(element, [lat, lon], 15);
            L.marker([lat, lon]).addTo(map)
              .bindPopup(`<b>${displayName}</b>`)
              .openPopup();
          }
        });
        
        // Update crime results if exists
        if (document.getElementById('crimeResults')) {
          const crimes = ['Theft', 'Harassment', 'Chain Snatching'];
          const randomCrime = crimes[Math.floor(Math.random() * crimes.length)];
          const randomCount = Math.floor(Math.random() * 20) + 5;
          
          document.getElementById('crimeResults').innerHTML = `
            <p><strong>Location:</strong> ${displayName}</p>
            <p><strong>Common Crime:</strong> ${randomCrime}</p>
            <p><strong>Reported Cases (Last 30 days):</strong> ${randomCount}</p>
            <p><strong>Safety Tips:</strong> Avoid walking alone at night in this area</p>
          `;
        }
      } else {
        alert("Location not found. Please try a different search term.");
      }
    })
    .catch(error => {
      console.error("Error fetching location data:", error);
      alert("Error searching location. Please try again.");
    });
}

// SOS Button Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize maps on their respective pages
  initMap('crimeMap');
  initMap('crimeHeatmap');
  initMap('liveMap');
  
  // SOS Button
  const sosBtn = document.getElementById('sosBtn');
  if (sosBtn) {
    sosBtn.addEventListener('click', function() {
      // Visual feedback
      this.innerHTML = '<i class="fas fa-bell-slash"></i><div class="icon-label">HELP COMING!</div>';
      this.style.backgroundColor = '#4CAF50';
      
      // Simulate sending alerts
      setTimeout(() => {
        alert("EMERGENCY ALERT:\nYour location has been shared with police and emergency contacts!");
      }, 500);
      
      // Reset after 5 seconds
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-bell"></i><div class="icon-label">SOS</div>';
        this.style.backgroundColor = '#ff4081';
      }, 5000);
    });
  }
  
  // Add Contact Functionality
  const addContactBtn = document.getElementById('addContactBtn');
  if (addContactBtn) {
    addContactBtn.addEventListener('click', function() {
      const name = document.getElementById('contactName').value.trim();
      const phone = document.getElementById('contactPhone').value.trim();
      
      if (name && phone) {
        alert(`Emergency contact added:\n${name} - ${phone}`);
        document.getElementById('contactName').value = '';
        document.getElementById('contactPhone').value = '';
      } else {
        alert("Please enter both name and phone number");
      }
    });
  }
});