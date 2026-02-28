const apiKey = "3be1383aacf701901807a86a81905979";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

const searchBox = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");
const weatherIcon = document.querySelector(".weather-icon");

// 🔍 Check weather by city name
async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    // Update UI
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

    // Change icon based on condition
    const condition = data.weather[0].main.toLowerCase();
    if (condition.includes("cloud")) weatherIcon.src = "./images/clouds.png";
    else if (condition.includes("clear")) weatherIcon.src = "./images/clear.png";
    else if (condition.includes("rain")) weatherIcon.src = "./images/rain.png";
    else if (condition.includes("snow")) weatherIcon.src = "./images/snow.png";
    else if (condition.includes("mist") || condition.includes("haze")) weatherIcon.src = "./images/mist.png";
    else weatherIcon.src = "./images/cloud.png";

    document.querySelector(".weather").style.display = "block";

  } catch (error) {
    alert(error.message);
  }
}

// 🔎 Button search
searchBtn.addEventListener("click", () => {
  const city = searchBox.value.trim();
  if (city !== "") {
    checkWeather(city);
  } else {
    alert("Please enter a city name");
  }
});

// 📍 Auto-detect user location
function getUserLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      const response = await fetch(url);
      const data = await response.json();

      document.querySelector(".city").innerHTML = data.name;
      document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
      document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
      document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";
      document.querySelector(".weather").style.display = "block";
    }, 
    () => console.log("Location access denied. Please search manually."));
  } else {
    console.log("Geolocation not supported.");
  }
}

// Auto-fetch on load
window.addEventListener("load", getUserLocationWeather);
