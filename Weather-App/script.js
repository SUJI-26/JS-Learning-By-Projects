const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey = "3be1383aacf701901807a86a81905979";

weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        displayError("Please enter a city");
        return;
    }

    try {
        const weatherData = await getWeatherData(city);
        displayWeatherInfo(weatherData);
    } catch (error) {
        displayError(error.message);
    }
});

async function getWeatherData(city) {
    const apiUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
        throw new Error("City not found");
    }

    return await response.json();
}

function displayWeatherInfo(data) {
    const {
        name: city,
        main: { temp, humidity },
        weather: [{ description, id }]
    } = data;

    card.textContent = "";
    card.style.display = "flex";

    const cityDisplay = document.createElement("h1");
    const tempDisplay = document.createElement("p");
    const humidityDisplay = document.createElement("p");
    const descDisplay = document.createElement("p");
    const weatherEmoji = document.createElement("p");

    cityDisplay.textContent = city;
    tempDisplay.textContent = `${temp.toFixed(1)}°C`;
    humidityDisplay.textContent = `Humidity: ${humidity}%`;
    descDisplay.textContent = description;
    weatherEmoji.textContent = getWeatherEmoji(id);

    cityDisplay.classList.add("cityDisplay");
    tempDisplay.classList.add("tempDisplay");
    humidityDisplay.classList.add("humidityDisplay");
    descDisplay.classList.add("descDisplay");
    weatherEmoji.classList.add("weatherEmoji");

    card.append(
        cityDisplay,
        tempDisplay,
        humidityDisplay,
        descDisplay,
        weatherEmoji
    );
}

function getWeatherEmoji(weatherId) {
    switch (true) {
        case weatherId >= 200 && weatherId < 300:
            return "A";
        case weatherId >= 300 && weatherId < 400:
            return "🌦️";
        case weatherId >= 500 && weatherId < 600:
            return "🌧️";
        case weatherId >= 600 && weatherId < 700:
            return "❄️";
        case weatherId >= 700 && weatherId < 800:
            return "🌫️";
        case weatherId === 800:
            return "☀️";
        case weatherId > 800:
            return "☁️";
        default:
            return "❓";
    }
}
function displayError(message) {
    card.textContent = "";
    card.style.display = "flex";

    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    card.appendChild(errorDisplay);
}
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
