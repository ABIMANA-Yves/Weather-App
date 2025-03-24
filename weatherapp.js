const container = document.querySelector('.container');
const searchButton = document.querySelector('.search-box button');
const searchInput = document.querySelector('.search-box input');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const cityHide = document.querySelector('.city-hide');
const loading = document.querySelector('.loading');
const errorMessage = document.querySelector('.error-message');

function fetchWeather() {
    const APIKey = '76ca1183f624b748769363dbb9622fed';
    const input = searchInput.value.trim();

    // Reset UI
    loading.style.display = 'none';
    errorMessage.style.display = 'none';
    weatherBox.classList.remove('active');
    weatherDetails.classList.remove('active');
    error404.classList.remove('active');

    if (input === '') {
        errorMessage.textContent = 'Please enter a location (e.g., Rusizi, RW or -2.49,28.90).';
        errorMessage.style.display = 'block';
        container.style.height = '180px';
        return;
    }

    // Check if input is coordinates (e.g., "-2.49,28.90")
    const coordRegex = /^[-+]?\d*\.?\d+,\s*[-+]?\d*\.?\d+$/;
    let url;

    if (coordRegex.test(input)) {
        const [lat, lon] = input.split(',').map(coord => coord.trim());
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`;
    } else {
        // Try city name first, default to Rwanda if no country code
        let city = input;
        if (!city.includes(',')) {
            city += ',RW';
        }
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`;
    }

    // Show loading indicator
    loading.style.display = 'block';
    container.style.height = '180px';

    fetch(url)
        .then(response => response.json())
        .then(json => {
            loading.style.display = 'none';

            if (json.cod === '404' && !coordRegex.test(input)) {
                // Fallback to geocoding if city not found
                fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=1&appid=${APIKey}`)
                    .then(geoResponse => geoResponse.json())
                    .then(geoData => {
                        if (geoData.length > 0) {
                            const { lat, lon } = geoData[0];
                            fetchWeatherByCoords(lat, lon);
                        } else {
                            cityHide.textContent = input;
                            container.style.height = '600px';
                            error404.classList.add('active');
                        }
                    })
                    .catch(() => {
                        cityHide.textContent = input;
                        container.style.height = '600px';
                        error404.classList.add('active');
                    });
                return;
            } else if (json.cod !== 200) {
                errorMessage.textContent = 'An error occurred. Please try again later.';
                errorMessage.style.display = 'block';
                container.style.height = '180px';
                return;
            }

            updateWeatherUI(json);
        })
        .catch(error => {
            loading.style.display = 'none';
            errorMessage.textContent = 'Failed to fetch weather data. Check spelling or connection.';
            errorMessage.style.display = 'block';
            container.style.height = '180px';
            console.error('Error fetching weather data:', error);
        });
}

function fetchWeatherByCoords(lat, lon) {
    const APIKey = '76ca1183f624b748769363dbb9622fed';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`;

    loading.style.display = 'block';
    fetch(url)
        .then(response => response.json())
        .then(json => {
            loading.style.display = 'none';
            if (json.cod !== 200) {
                errorMessage.textContent = 'Weather data not available for these coordinates.';
                errorMessage.style.display = 'block';
                container.style.height = '180px';
                return;
            }
            updateWeatherUI(json);
        })
        .catch(error => {
            loading.style.display = 'none';
            errorMessage.textContent = 'Failed to fetch weather data. Check coordinates.';
            errorMessage.style.display = 'block';
            container.style.height = '180px';
            console.error('Error fetching weather data:', error);
        });
}

function updateWeatherUI(json) {
    const image = document.querySelector('.weather-box img');
    const temperature = document.querySelector('.weather-box .temperature');
    const description = document.querySelector('.weather-box .description');
    const humidity = document.querySelector('.weather-details .humidity span');
    const wind = document.querySelector('.weather-details .wind span');

    switch (json.weather[0].main) {
        case 'Clear':
            image.src = 'img/clear.png';
            break;
        case 'Rain':
            image.src = 'img/rain.png';
            break;
        case 'Snow':
            image.src = 'img/snow.png';
            break;
        case 'Clouds':
            image.src = 'img/cloud.png';
            break;
        case 'Mist':
        case 'Haze':
            image.src = 'img/mist.png';
            break;
        default:
            image.src = 'img/cloud.png';
    }

    temperature.innerHTML = `${json.main.temp.toFixed(1)}<span><sup>°</sup>C</span>`;
    description.innerHTML = `${json.weather[0].description}`;
    humidity.innerHTML = `${json.main.humidity}%`;
    wind.innerHTML = `${(json.wind.speed * 3.6).toFixed(1)} Km/h`;

    container.style.height = '700px';
    setTimeout(() => {
        weatherBox.classList.add('active');
        weatherDetails.classList.add('active');
        searchInput.value = '';
    }, 100);
}

// Trigger search with button click
searchButton.addEventListener('click', fetchWeather);

// Trigger search with Enter key
searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchWeather();
    }
});