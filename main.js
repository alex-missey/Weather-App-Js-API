import "./style.css"
import { getWeather } from "./weather.js"
import { ICON_MAP } from "./icon-map.js"

/* Declare all constants at the begining of the file so they are accessible instantly at runtime */

// QuerySelectors 
const currentIcon = document.querySelector("[data-current-icon]")
// Check if value null to avoid typeErrors
currentIcon === null ? console.warn(`currentIcon ([data-current-icon]) is NULL!`) : null

const dailySection = document.querySelector("[data-day-section]")
dailySection === null ? console.warn(`dailySection ([data-day-section]) is NULL!`) : null
const hourlySection = document.querySelector("[data-hour-section]")
hourlySection === null ? console.warn(`hourlySection ([data-hour-section]) is NULL!`) : null
// Templates
const dayCardTemplate = document.getElementById("day-card-template")
dayCardTemplate === null ? console.warn(`dayCardTemplate (day-card-template) is NULL!`) : null
const hourRowTemplate = document.getElementById("hour-row-template")
hourRowTemplate === null ? console.warn(`hourRowTemplate (hour-row-template) is NULL!`) : null
// DateTimeFormats
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })
const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })

/* Declare all constants at the begining of the file so they are accessible instantly at runtime */

// Set to a variable and use 'await' so we don't have to use .then()
// This will allow us to catch errors in getWeather and renderWeather individually to help narrow the scope of the problem
// since axios.get() returns a promise, we need to use 'await' to wait for that promise to resolve before rendering the data
// the reason this was not required before, is because .then() awaits the promise's resolution before running
let data = await getWeather(10, 10, TIMEZONE).catch((err) => {
  console.error(err);
  alert("Error when setting data with getWeather");
});

// If data is not null, console.log the response from getWeather
data ? console.log(`getWeather response\n-------------------`) : null
data ? console.log(data) : null

// We need to use a try-catch block here instead of .catch(), since .catch() can only be used on promises, which is either 'await', .then(), or try{}
try {
  renderWeather(data)
} catch (err) {
  console.error(err);
  alert("Error when rendering weather with rednerWeather");
}

// intl.datetimeformat just gives us the time of the current timezone we are in
// .then() returns to us a promise, res means result
// took out res and just put data because we aren't getting a response
// put .then(renderWeather) and deleted the rest
// put .catch on there in case something goes wrong

function renderWeather({ current, daily, hourly }) {
  // use individual functions
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
  // remove blurred class
  document.body.classList.remove("blurred")
}

function setValue(selector, value, { parent = document } = {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
  // started everything with data- so pass everything after that
}

function getIconUrl(iconCode) {
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}


function renderCurrentWeather(current) {
  //document.querySelector("[data-current-temp]").textContent = current.currentTemp
  // Would need to do this ^^^ multiple times, make helper function instead
  currentIcon.src = getIconUrl(current.iconCode)
  setValue("current-temp", current.currentTemp)
  setValue("current-high", current.highTemp)
  setValue("current-low", current.lowTemp)
  setValue("current-fl-high", current.highFeelsLike)
  setValue("current-fl-low", current.lowFeelsLike)
  setValue("current-wind", current.windSpeed)
  setValue("current-precip", current.precip)
}

function renderDailyWeather(daily) {
  dailySection.innerHTML = ""
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)
    // makes sure it clones all of its children (clone a template)
    setValue("temp", day.maxTemp, { parent: element })
    setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(day.iconCode)
    dailySection.append(element)
  })
}

function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = ""
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true)
    // makes sure it clones all of its children (clone a template)
    setValue("temp", hour.temp, { parent: element })
    setValue("fl-temp", hour.feelsLike, { parent: element })
    setValue("wind", hour.windSpeed, { parent: element })
    setValue("precip", hour.precip, { parent: element })
    setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element })
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
    element.querySelector("[data-icon]").src = getIconUrl(hour.iconCode)
    hourlySection.append(element)
  })
}
