# 🌤️ Atmosphere — Modern Weather Experience

Atmosphere is a premium, client-side weather forecasting application built with standard HTML5, CSS3, and JavaScript. It provides a stunning, glassmorphism-based user interface with animated background glow (auras) that adapt dynamically based on the current weather condition of the searched location.

![Atmosphere Design](https://img.shields.io/badge/Design-Premium%20Glassmorphism-blueviolet?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JS-blue?style=for-the-badge)

---

## ✨ Features

- **Dynamic Ambient Glows**: The background aura blobs morph and change color palettes based on the weather condition (e.g., warm sunset colors for clear sky, cool blues for rain, dark deep purples for thunderstorms).
- **Comprehensive Weather Metrics**:
  - Main temperature, city name, and weather description.
  - Feels like temperature, wind speed, humidity, and visibility.
- **Sun Cycle Tracker**: Displays precise sunrise and sunset times, correctly adjusted to the local timezone of the queried city.
- **5-Day Forecast**: Shows the upcoming week's weather outlook with daily icons and temperatures.
- **Persistent Recent Searches**: Stores recent searches in `localStorage` for quick access and instant reloading.
- **Robust Developer Configuration**: Built-in fallback loading mechanism to handle local server security restrictions on serving dotfiles.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Flexbox, CSS Variables, Keyframe Animations)
- **Typography**: [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts
- **Data Provider**: [OpenWeatherMap API](https://openweathermap.org/api)

---

## 🚀 Getting Started

### 1. Prerequisites
- A local web server (like VS Code's **Live Server** extension, Python's `http.server`, or Node's `http-server`).
- An API Key from [OpenWeatherMap](https://openweathermap.org/).

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/ujjwal-alhawath/final-weather-app.git
cd weather
```

### 3. API Key Configuration
Due to security restrictions on modern static web servers, files starting with a dot (such as `.env`) are blocked by default. Atmosphere supports a double-layer environment loading setup:

1. Copy `.env.example` to `.env` **and** to `env` (without a dot):
   ```bash
   cp .env.example .env
   cp .env.example env
   ```
2. Open the `env` and `.env` files and paste your OpenWeatherMap API key:
   ```env
   OPENWEATHER_API_KEY=your_api_key_here
   ```

*Note: Both `.env` and `env` are pre-configured in `.gitignore` to ensure your credentials are never pushed to GitHub.*

### 4. Running the App
Open the project directory in your editor (e.g. VS Code) and start your local server.
If using VS Code Live Server, right-click `weather.html` and select **Open with Live Server**. The app will load on `http://127.0.0.1:5501/weather.html`.

---

## 🔒 Security Note
Since this is a client-side static application, API requests are made directly from the user's browser. For development, the credentials are loaded from local `env` / `.env` files. In a production environment, it is highly recommended to proxy these requests through a backend server to prevent exposing your API key to the public client.
