const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key
const resultsDiv = document.getElementById("results");
const locationInput = document.getElementById("locationInput");
const checkButton = document.getElementById("checkPollution");
const cityNameSpan = document.getElementById("cityName");
const aqiSpan = document.getElementById("aqi");
const adviceSpan = document.getElementById("advice");

checkButton.addEventListener("click", () => {
  const location = locationInput.value.trim();
  if (!location) {
    alert("Please enter a location!");
    return;
  }
  fetchPollutionData(location);
});

async function fetchPollutionData(location) {
  try {
    // Fetch coordinates for the location
    const geoRes = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (geoData.length === 0) {
      alert("Location not found!");
      return;
    }

    const { lat, lon, name } = geoData[0];

    // Fetch pollution data
    const pollutionRes = await fetch(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const pollutionData = await pollutionRes.json();

    const aqi = pollutionData.list[0].main.aqi;
    const advice = getPollutionAdvice(aqi);

    displayResults(name, aqi, advice);
    plotChart(pollutionData.list[0].components);
  } catch (error) {
    console.error("Error fetching data:", error);
    alert("Something went wrong. Please try again!");
  }
}

function getPollutionAdvice(aqi) {
  switch (aqi) {
    case 1: return "Good: Air quality is satisfactory.";
    case 2: return "Fair: Air quality is acceptable.";
    case 3: return "Moderate: Sensitive groups should limit outdoor activities.";
    case 4: return "Poor: Health warnings for sensitive groups.";
    case 5: return "Very Poor: Everyone should avoid outdoor activities.";
    default: return "Unknown AQI value.";
  }
}

function displayResults(city, aqi, advice) {
  cityNameSpan.textContent = city;
  aqiSpan.textContent = aqi;
  adviceSpan.textContent = advice;

  resultsDiv.classList.remove("hidden");
}

function plotChart(components) {
  const ctx = document.getElementById("pollutionChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(components),
      datasets: [{
        label: "Pollutant Levels",
        data: Object.values(components),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
