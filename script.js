let apikey = "";
const apiurl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

async function loadApiKey() {
    try {
        const response = await fetch('.env');
        if (!response.ok) throw new Error('Failed to load .env file');
        const text = await response.text();
        const lines = text.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('#') || trimmedLine === '') continue;
            const parts = trimmedLine.split('=');
            if (parts.length >= 2 && parts[0].trim() === 'OPENWEATHER_API_KEY') {
                apikey = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                break;
            }
        }
    } catch (error) {
        console.error("Could not load API key from .env file:", error);
    }
}

// Weather glows mappings for background aura circles
const weatherGlows = {
    Clear: ["#ea580c", "#eab308", "#f97316"],
    Clouds: ["#374151", "#4b5563", "#1f2937"],
    Rain: ["#1d4ed8", "#2563eb", "#1e3a8a"],
    Drizzle: ["#0284c7", "#0ea5e9", "#075985"],
    Mist: ["#475569", "#64748b", "#334155"],
    Fog: ["#475569", "#64748b", "#334155"],
    Haze: ["#475569", "#64748b", "#334155"],
    Snow: ["#0284c7", "#38bdf8", "#e0f2fe"],
    Thunderstorm: ["#1e1b4b", "#311042", "#2e1065"],
    Default: ["#1e293b", "#0f172a", "#111827"]
};

// Weather local-storage cache keys
const STORAGE_KEY = "weather_recent_searches";

let searchBox = document.querySelector("#inp");
let btn = document.querySelector("#btn");

function getWeatherIcon(mainCondition) {
    switch (mainCondition) {
        case "Clouds": return "images/clouds.png";
        case "Clear": return "images/clear.png";
        case "Rain": return "images/rain.png";
        case "Drizzle": return "images/drizzle.png";
        case "Mist":
        case "Fog":
        case "Haze":
            return "images/mist.png";
        case "Snow": return "images/snow.png";
        case "Thunderstorm":
        default:
            return "images/wind.png";
    }
}

function formatLocalTime(utcSeconds, timezoneOffsetSeconds) {
    const utcDate = new Date(utcSeconds * 1000);
    const localTimeMs = utcDate.getTime() + (timezoneOffsetSeconds * 1000);
    const localDate = new Date(localTimeMs);

    let hours = localDate.getUTCHours();
    const minutes = localDate.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutesStr} ${ampm}`;
}

async function checkWeather(city) {
    if (!city) return;

    if (!apikey) {
        await loadApiKey();
    }
    if (!apikey) {
        console.error("API key is not configured.");
        alert("API key is missing! Please configure it in your .env file.");
        return;
    }

    try {
        const response = await fetch(`${apiurl}${city}&appid=${apikey}`);

        if (response.status === 404) {
            document.querySelector("#errorBox").style.display = "block";
            document.querySelector("#weatherContent").style.display = "none";
            return;
        }

        const data = await response.json();

        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}&appid=${apikey}`;
        const forecastResponse = await fetch(forecastUrl);
        let forecastData = null;
        if (forecastResponse.ok) {
            forecastData = await forecastResponse.json();
        }

        updateWeatherUI(data, forecastData);
        saveToRecentSearches(city);

        document.querySelector("#errorBox").style.display = "none";
        document.querySelector("#weatherContent").style.display = "block";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        document.querySelector("#errorBox").style.display = "block";
        document.querySelector("#weatherContent").style.display = "none";
    }
}

function updateWeatherUI(data, forecastData) {
    // 1. Core Info
    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°C";
    document.querySelector(".description").innerHTML = data.weather[0].description;

    // 2. Weather Icon
    const weatherIcon = document.querySelector(".weather-icon");
    const condition = data.weather[0].main;
    weatherIcon.src = getWeatherIcon(condition);

    // 3. Stats Grid
    document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
    document.querySelector(".wind").innerHTML = Math.round(data.wind.speed) + " km/h";
    document.querySelector(".feels-like").innerHTML = Math.round(data.main.feels_like) + "°C";
    document.querySelector(".visibility").innerHTML = (data.visibility / 1000).toFixed(1) + " km";

    // 4. Sun Cycle
    const timezoneOffset = data.timezone;
    document.querySelector(".sunrise").innerHTML = formatLocalTime(data.sys.sunrise, timezoneOffset);
    document.querySelector(".sunset").innerHTML = formatLocalTime(data.sys.sunset, timezoneOffset);

    // 5. Dynamic Background Glows (Auras)
    const glows = weatherGlows[condition] || weatherGlows.Default;
    document.documentElement.style.setProperty('--bg-glow-1', glows[0]);
    document.documentElement.style.setProperty('--bg-glow-2', glows[1]);
    document.documentElement.style.setProperty('--bg-glow-3', glows[2]);

    // 6. 5-Day Forecast
    const forecastGrid = document.querySelector("#forecastGrid");
    forecastGrid.innerHTML = "";

    if (forecastData && forecastData.list) {
        const dailyForecasts = [];
        const seenDates = new Set();

        for (const item of forecastData.list) {
            const dateStr = item.dt_txt.split(" ")[0];

            // Extract midday reading (12:00:00 UTC) for general daily overview
            if (item.dt_txt.includes("12:00:00") && !seenDates.has(dateStr)) {
                dailyForecasts.push(item);
                seenDates.add(dateStr);
            }
        }

        // Pad with first reading of day if midday is unavailable
        if (dailyForecasts.length < 5) {
            for (const item of forecastData.list) {
                const dateStr = item.dt_txt.split(" ")[0];
                if (!seenDates.has(dateStr) && dailyForecasts.length < 5) {
                    dailyForecasts.push(item);
                    seenDates.add(dateStr);
                }
            }
        }

        dailyForecasts.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const temp = Math.round(item.main.temp) + "°";
            const cond = item.weather[0].main;
            const iconSrc = getWeatherIcon(cond);

            const forecastItem = document.createElement("div");
            forecastItem.className = "forecast-item";
            forecastItem.innerHTML = `
                <span class="forecast-day">${dayName}</span>
                <img src="${iconSrc}" alt="${cond}" class="forecast-icon">
                <span class="forecast-temp">${temp}</span>
            `;
            forecastGrid.appendChild(forecastItem);
        });
    }
}

function getRecentSearches() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : ["london", "new york", "tokyo"];
    } catch (e) {
        return ["london", "new york", "tokyo"];
    }
}

function saveToRecentSearches(city) {
    let searches = getRecentSearches();
    const cityLower = city.trim().toLowerCase();

    searches = searches.filter(item => item !== cityLower);
    searches.unshift(cityLower);

    if (searches.length > 5) {
        searches = searches.slice(0, 5);
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
    } catch (e) {
        console.error("Failed to save search history:", e);
    }

    renderRecentSearches();
}

function renderRecentSearches() {
    const container = document.querySelector("#recentSearches");
    if (!container) return;
    container.innerHTML = "";

    const searches = getRecentSearches();
    searches.forEach(city => {
        const tag = document.createElement("span");
        tag.className = "recent-tag";
        tag.innerText = city;
        tag.addEventListener("click", () => {
            searchBox.value = city;
            checkWeather(city);
        });
        container.appendChild(tag);
    });
}

// Event Listeners
btn.addEventListener("click", function () {
    checkWeather(searchBox.value);
});

searchBox.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
        checkWeather(searchBox.value);
    }
});



// Safe Initialization on DOM load
function init() {
    renderRecentSearches();
    const searches = getRecentSearches();
    if (searches.length > 0) {
        checkWeather(searches[0]);
    }
}

if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
