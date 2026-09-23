
document.addEventListener("DOMContentLoaded", function () {
  setActiveNavLink();
  setupMobileNav();
  setupHeaderScrollShadow();
  setupBarChartReveal();
  setupCountUp();
  setupWeatherWidget();
});

function setActiveNavLink() {
  const links = document.querySelectorAll(".nav-links a");
  if (!links.length) return;

  // Get current file name, defaulting to index.html for "/" or ""
  let currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "") currentPage = "index.html";

  links.forEach(function (link) {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

/**
 * 2. Toggle the mobile navigation menu open/closed and
 * close it automatically after a link is chosen.
 */
function setupMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-links");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close the menu if the viewport is resized back to desktop width
  window.addEventListener("resize", function () {
    if (window.innerWidth > 640 && menu.classList.contains("is-open")) {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * 3. Add a subtle shadow to the sticky header once the
 * page has been scrolled, so it visually separates from content.
 */
function setupHeaderScrollShadow() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  function updateShadow() {
    header.classList.toggle("is-scrolled", window.scrollY > 4);
  }
  updateShadow();
  window.addEventListener("scroll", updateShadow, { passive: true });
}

/**
 * 4a. Animate the bar chart (used on effects.html) so bars
 * grow into view the first time they enter the viewport,
 * rather than animating on every scroll pass.
 */
function setupBarChartReveal() {
  const bars = document.querySelectorAll(".bar");
  if (!bars.length) return;

  if (!("IntersectionObserver" in window)) {
    bars.forEach(function (bar) { bar.classList.add("is-visible"); });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  bars.forEach(function (bar) { observer.observe(bar); });
}

/**
 * 4b. Count numeric stats up from 0 to their target value
 * once they scroll into view, for a bit of restrained motion
 * on the headline statistics.
 */
function setupCountUp() {
  const targets = document.querySelectorAll("[data-count-to]");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  targets.forEach(function (el) { observer.observe(el); });
}

function animateCount(el) {
  const target = parseFloat(el.getAttribute("data-count-to"));
  const decimals = el.getAttribute("data-decimals") ? parseInt(el.getAttribute("data-decimals"), 10) : 0;
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = target * eased;
    el.textContent = value.toFixed(decimals) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toFixed(decimals) + suffix;
    }
  }
  requestAnimationFrame(tick);
}

/* =========================================================
   TASK 2 — LIVE WEATHER API INTEGRATION
   Uses the OpenWeatherMap "Current Weather Data" endpoint:
   https://api.openweathermap.org/data/2.5/weather

   ⚠ API KEY — read this before testing:
   Sign up for a free key at https://openweathermap.org/api,
   then paste it below in place of "YOUR_API_KEY". This is a
   placeholder for local/training use only. Never commit a
   real API key to a public GitHub repository — for a real
   deployment, call the API from a small backend/serverless
   proxy (or an environment variable injected at build time)
   so the key isn't exposed in client-side JavaScript.
   ========================================================= */
const WEATHER_API_KEY = "8657fe8d117401ade9a53c80ef3622db";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

function setupWeatherWidget() {
  const form = document.getElementById("weather-form");
  const input = document.getElementById("weather-input");
  const resultEl = document.getElementById("weather-result");
  if (!form || !input || !resultEl) return; // widget isn't on this page

  // Handles both the Search button (type="submit") and pressing
  // Enter inside the input, since both trigger a form submit.
  form.addEventListener("submit", function (event) {
    event.preventDefault(); // no page reload
    handleWeatherSearch(input.value, resultEl);
  });
}

async function handleWeatherSearch(rawLocation, resultEl) {
  const location = rawLocation.trim();

  if (!location) {
    renderWeatherError(resultEl, "Please enter a location.");
    return;
  }

  renderWeatherLoading(resultEl);

  try {
    const data = await fetchWeather(location);
    renderWeatherResult(resultEl, data);
  } catch (err) {
    renderWeatherError(resultEl, err.message || "Unable to fetch weather data. Please try again.");
  }
}

/**
 * Requests current weather for a location from OpenWeatherMap
 * using fetch() + async/await, and returns the parsed JSON.
 * Throws a user-friendly Error for the UI to display on failure.
 */
async function fetchWeather(location) {
  if (WEATHER_API_KEY === "YOUR_API_KEY") {
    throw new Error("Weather API key missing. Add your OpenWeatherMap key to WEATHER_API_KEY in js/script.js.");
  }

  const url =
    WEATHER_API_URL +
    "?q=" + encodeURIComponent(location) +
    "&units=metric" +
    "&appid=" + WEATHER_API_KEY;

  let response;
  try {
    response = await fetch(url);
  } catch (networkErr) {
    // fetch() itself only rejects on network failure (offline, DNS, CORS, etc.)
    throw new Error("Network error. Check your connection and try again.");
  }

  if (response.status === 404) {
    throw new Error("City not found. Please try another location.");
  }
  if (response.status === 401) {
    throw new Error("Invalid API key. Check WEATHER_API_KEY in js/script.js.");
  }
  if (!response.ok) {
    throw new Error("Unable to fetch weather data. Please try again.");
  }

  const data = await response.json();
  return data;
}

function renderWeatherLoading(resultEl) {
  resultEl.innerHTML =
    '<p class="weather-status"><span class="weather-spinner" aria-hidden="true"></span>Loading weather data…</p>';
}

function renderWeatherError(resultEl, message) {
  resultEl.innerHTML = '<p class="weather-error">' + escapeHTML(message) + "</p>";
}

function renderWeatherResult(resultEl, data) {
  const cityName = data.name || "Unknown location";
  const country = data.sys && data.sys.country ? data.sys.country : "";
  const temp = data.main && typeof data.main.temp === "number" ? Math.round(data.main.temp) : "—";
  const humidity = data.main && typeof data.main.humidity === "number" ? data.main.humidity : "—";
  const windSpeed = data.wind && typeof data.wind.speed === "number" ? data.wind.speed : "—";
  const condition = data.weather && data.weather[0] ? data.weather[0].main : "—";
  const description = data.weather && data.weather[0] ? data.weather[0].description : "";
  const iconCode = data.weather && data.weather[0] ? data.weather[0].icon : null;
  const iconUrl = iconCode
    ? "https://openweathermap.org/img/wn/" + iconCode + "@2x.png"
    : "";

  resultEl.innerHTML =
    '<div class="weather-card">' +
    '<div class="wc-primary">' +
    (iconUrl
      ? '<img class="wc-icon" src="' + iconUrl + '" alt="' + escapeHTML(description || condition) + '">'
      : "") +
    '<span class="wc-temp">' + temp + "°C</span>" +
    '<span class="wc-condition">' + escapeHTML(description || condition) + "</span>" +
    "</div>" +
    "<div>" +
    '<div class="wc-location">' + escapeHTML(cityName) +
    (country ? '<span class="country">' + escapeHTML(country) + "</span>" : "") +
    "</div>" +
    '<div class="wc-meta">' +
    '<div class="wc-meta-item"><span class="label">Condition</span><span class="value">' + escapeHTML(condition) + "</span></div>" +
    '<div class="wc-meta-item"><span class="label">Humidity</span><span class="value">' + humidity + "%</span></div>" +
    '<div class="wc-meta-item"><span class="label">Wind speed</span><span class="value">' + windSpeed + " m/s</span></div>" +
    '<div class="wc-meta-item"><span class="label">Country</span><span class="value">' + escapeHTML(country || "—") + "</span></div>" +
    "</div>" +
    "</div>" +
    "</div>";
}

/** Minimal HTML-escaping so API text can't break markup if it ever contains special characters. */
function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}
