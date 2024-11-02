console.log("Hello CodeSandbox");
// index.js
require('dotenv').config();
require("dotenv").config();
//API_KEY=62dc0ae6d9c722b614c6e5121448c4a0
console.log('API_KEY:', process.env.API_KEY);

const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

// Serve static files (index.html and any CSS/JS files) from the root directory
app.use(express.static(path.join(__dirname)));

// Weather endpoint to fetch forecast and determine if an umbrella is needed
app.get("/weather", async (req, res) => {
  const location = req.query.location;
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

  try {
    const response = await axios.get(apiUrl);
    const recommendations = shouldBringUmbrella(response.data);
    res.json({ recommendations });
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send("Error fetching weather data");
  }
});

// Umbrella-checking logic function
function shouldBringUmbrella(forecast) {
  const recommendations = [];
  const dailyForecasts = {};

  forecast.list.forEach((entry) => {
    const date = entry.dt_txt.split(" ")[0];
    if (!dailyForecasts[date]) dailyForecasts[date] = [];
    dailyForecasts[date].push(entry);
  });

  for (const date in dailyForecasts) {
    const dayEntries = dailyForecasts[date];
    let umbrellaNeeded = false;

    for (const entry of dayEntries) {
      const rain = entry.rain ? entry.rain["3h"] : 0;
      const weather = entry.weather[0].main;

      if (rain > 0 || (weather === "Clear" && entry.uvi && entry.uvi > 5)) {
        umbrellaNeeded = true;
        break;
      }
    }

    recommendations.push(
      umbrellaNeeded ? "Yes, bring an umbrella." : "No umbrella needed."
    );
  }

  return recommendations;
}

// Root endpoint to serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
