const API_KEY = 'a31d8ce0f1e71f86dceff040ad92dd3a'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// Mapping weather conditions to emojis
const weatherEmojis = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Default: '🌍',
};

// Event listener for search button
document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) {
        getCurrentWeather(city);
        getForecast(city);
    } else {
        alert('Please enter a city name.');
    }
});

// Fetch current weather
function getCurrentWeather(city) {
    fetch(`${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) throw new Error('City not found!');
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
            getUVIndex(data.coord.lat, data.coord.lon); // Fetch UV index using coordinates
        })
        .catch(error => alert(`Error: ${error.message}`));
}

// Fetch UV Index
function getUVIndex(lat, lon) {
    fetch(`${BASE_URL}uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => displayUVIndex(data.value))
        .catch(error => console.error('Error fetching UV index:', error));
}

// Fetch 5-day forecast
function getForecast(city) {
    fetch(`${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`)
        .then(response => {
            if (!response.ok) throw new Error('City not found!');
            return response.json();
        })
        .then(data => displayForecast(data))
        .catch(error => alert(`Error: ${error.message}`));
}

// Display current weather
function displayCurrentWeather(data) {
    const weatherMain = data.weather[0].main;
    const emoji = weatherEmojis[weatherMain] || weatherEmojis.Default;
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    const weatherInfo = `
        <div class="weather-card">
            <h2>${emoji} ${data.name}</h2>
            <p>🌡️ Temperature: ${data.main.temp}°C</p>
            <p>💧 Humidity: ${data.main.humidity}%</p>
            <p>💨 Wind Speed: ${data.wind.speed} m/s</p>
            <p>🌥️ Weather: ${data.weather[0].description}</p>
            <p>🌅 Sunrise: ${sunrise}</p>
            <p>🌇 Sunset: ${sunset}</p>
            <div id="uv-index"></div> <!-- UV index will be displayed here -->
        </div>
    `;
    document.getElementById('weather-info').innerHTML = weatherInfo;
}

// Display UV index
function displayUVIndex(uvIndex) {
    const uvIndexElement = document.getElementById('uv-index');
    uvIndexElement.innerHTML = `<p>☀️ UV Index: ${uvIndex}</p>`;
}

// Display 5-day forecast
function displayForecast(data) {
    let forecastHTML = '<h3>5-Day Forecast</h3>';
    const dailyData = {};

    // Process data to get daily highs and lows
    data.list.forEach(item => {
        const date = new Date(item.dt_txt).toLocaleDateString();
        if (!dailyData[date]) {
            dailyData[date] = {
                high: item.main.temp_max,
                low: item.main.temp_min,
                weather: item.weather[0].description,
                main: item.weather[0].main,
            };
        } else {
            dailyData[date].high = Math.max(dailyData[date].high, item.main.temp_max);
            dailyData[date].low = Math.min(dailyData[date].low, item.main.temp_min);
        }
    });

    // Create forecast cards
    for (const date in dailyData) {
        const { high, low, weather, main } = dailyData[date];
        const emoji = weatherEmojis[main] || weatherEmojis.Default;

        forecastHTML += `
            <div class="forecast-card">
                <p>${date}</p>
                <p>${emoji} High: ${high}°C | Low: ${low}°C</p>
                <p>Weather: ${weather}</p>
            </div>
        `;
    }

    document.getElementById('forecast-info').innerHTML = forecastHTML;
}
