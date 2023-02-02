import "./style.css"
import { getWeather } from "./weather"
import { ICON_MAP } from "./iconMap"

navigator.geolocation.getCurrentPosition(possitionSucess, positionError)

function possitionSucess({ coords }){
  getWeather(
    coords.latitude, 
    coords.longitude, 
    Intl.DateTimeFormat().resolvedOptions().timeZone
  )
  .then(renderWeather)
  .catch(e => {
    console.error(e)
    alert("Error getting weather")
  })
}

function positionError() {
  alert("Error getting your location. Please allow us to use your location and refresh the page.")
}

function renderWeather({ current, daily, hourly }){
  renderCurrentWeather(current)
  renderDailyWeather(daily)
  renderHourlyWeather(hourly)
  document.body.classList.remove("blurred")
}

//helper function that sets data atributes. Default value is set to document object. selector param is everything after data-..... ex:data-current-temp
function setValue(selector, value, { parent = document }= {}) {
  parent.querySelector(`[data-${selector}]`).textContent = value
}

function getIconUrl(iconCode){
  return `icons/${ICON_MAP.get(iconCode)}.svg`
}

const currentIcon = document.querySelector('[data-current-icon]')

function renderCurrentWeather(current) {
  currentIcon.scr = getIconUrl(current.iconCode)
  setValue("current-temp",current.currentTemp)
  setValue('current-high', current.highTemp)
  setValue('current-low', current.lowTemp)
  setValue('current-fl-high', current.highFeelsLike)
  setValue('current-fl-low', current.lowFeelsLike)
  setValue('current-wind', current.windSpeed)
  setValue('current-precip', current.precip)
  }
  //helper function replaces the need to do type over and over for each HTML element: document.querySelector('[data-current-temp]').textContent = current.currentTemp

const DAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "long" })//undefined = default location, { } return just the day portion of my weekday
const dailySection = document.querySelector("[data-day-section]")
const dayCardTemplate = document.getElementById("day-card-template")
function renderDailyWeather(daily) {
  dailySection.innerHTML = "" //renders card day section blank so we can set each one in API info
  daily.forEach(day => {
    const element = dayCardTemplate.content.cloneNode(true)//creates a new element that is a clone of the HTML template - passing true makes sure it clones all the children as well
    setValue("temp", day.maxTemp, { parent: element })//set values to parent of new element we just created 
    setValue("date", DAY_FORMATTER.format(day.timestamp), { parent: element })
    element.querySelector("[data-icon]").scr = getIconUrl(day.iconCode)
    dailySection.append(element)
  })
}

const HOUR_FORMATTER = new Intl.DateTimeFormat(undefined, { hour: "numeric" })
const hourlySection = document.querySelector("[data-hour-section]")
const hourRowTemplate = document.getElementById("hour-row-template")
function renderHourlyWeather(hourly) {
  hourlySection.innerHTML = "" 
  hourly.forEach(hour => {
    const element = hourRowTemplate.content.cloneNode(true)
    setValue("temp", hour.temp, { parent: element })
    setValue("fl-temp", hour.feelsLike, { parent: element })
    setValue("wind", hour.windSpeed, { parent: element })
    setValue("precip", hour.precip, { parent: element })
    setValue("day", DAY_FORMATTER.format(hour.timestamp), { parent: element })
    setValue("time", HOUR_FORMATTER.format(hour.timestamp), { parent: element })
    element.querySelector("[data-icon]").scr = getIconUrl(hour.iconCode)
    hourlySection.append(element)
  })
}