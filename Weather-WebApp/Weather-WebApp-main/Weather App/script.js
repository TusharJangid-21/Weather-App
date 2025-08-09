const apiKey = '64edae56aacd9863630a5e0927b9e60c'; // Replace with your actual OpenWeatherMap API key

// Get weather by city name
async function getWeather() {
  const city = document.getElementById('cityInput').value.trim();

  if (city === '') {
    document.getElementById('weatherData').innerHTML = '<p style="color: red;">Please enter a city name.</p>';
    return;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  document.getElementById('loader').style.display = 'block';
  document.getElementById('weatherData').innerHTML = '';

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('City not found');

    const data = await response.json();
    displayWeather(data);
    saveSearch(data.name);
  } catch (error) {
    document.getElementById('weatherData').innerHTML = `<p style="color: red;">${error.message}</p>`;
  } finally {
    document.getElementById('loader').style.display = 'none';
  }
}

// Get weather by current location
async function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

      document.getElementById('loader').style.display = 'block';
      document.getElementById('weatherData').innerHTML = '';

      try {
        const response = await fetch(url);
        const data = await response.json();
        displayWeather(data);
        saveSearch(data.name);
      } catch (error) {
        document.getElementById('weatherData').innerHTML = '<p style="color: red;">Failed to fetch weather.</p>';
      } finally {
        document.getElementById('loader').style.display = 'none';
      }
    }, () => {
      alert('Location access denied.');
    });
  } else {
    alert('Geolocation not supported by your browser.');
  }
}

// Display weather data
function displayWeather(data) {
  const icon = data.weather[0].icon;
  const iconUrl = `http://openweathermap.org/img/wn/${icon}@2x.png`;

  document.getElementById('weatherData').innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p><img src="${iconUrl}" alt="Icon"> Condition: ${data.weather[0].description}</p>
    <p>Temperature: ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind: ${data.wind.speed} m/s</p>
  `;
}

// Save recent search to localStorage
function saveSearch(city) {
  let history = JSON.parse(localStorage.getItem('history')) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem('history', JSON.stringify(history));
    renderSearchHistory();
  }
}

// Render search history
function renderSearchHistory() {
  const history = JSON.parse(localStorage.getItem('history')) || [];
  const container = document.getElementById('searchHistory');
  container.innerHTML = '<h3>Previous Searches</h3>';
  history.forEach(city => {
    const btn = document.createElement('button');
    btn.textContent = city;
    btn.onclick = () => {
      document.getElementById('cityInput').value = city;
      getWeather();
    };
    container.appendChild(btn);
  });
}

// Load history on page load
window.onload = renderSearchHistory;
