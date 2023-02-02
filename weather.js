import axios from "axios";

export function getWeather(lat, lon, timezone) {
    return axios.get(
        "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime", 
        { 
            params: {
            latitude: lat,
            longitude: lon,
            timezone,
            },
        }
    ).then(({ data }) => { 
        //get all the information(data) from the API then return it into a new object that contains these functions stored as variables - pass in data to the function
        return {
            current: parseCurrentWeather(data),
            daily: parseDailyWeather(data),
            hourly: parseHourlyWeather(data)
        }
    })
}

function parseCurrentWeather ({ current_weather, daily }) {
    //descructure to get info from data and setting to our variables
    const { 
        temperature: currentTemp, 
        windspeed: windSpeed, 
        weathercode: iconCode 
    } = current_weather
    
    const { 
        temperature_2m_max: [maxTemp], 
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFeelsLike],
        apparent_temperature_min: [minFeelsLike],
        precipitation_sum: [precip]
    } = daily
    return {
        currentTemp: Math.round(currentTemp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100,//round to the nearest 100th
        iconCode,
    }
}

function parseDailyWeather({ daily }) {
    //daily is an object of arrays- loop through with map, get the time and index 
    return daily.time.map((time, index) => {
        return { //return an object containing all the data we need to display
            timestamp: time * 1000, //API returns time is seconds and JS needs miliseconds
            iconCode: daily.weathercode[index],
            maxTemp: Math.round(daily.temperature_2m_max[index])//get temp at current index in loop
        }
    })
}

function parseHourlyWeather({ hourly, current_weather }) {
    return hourly.time.map((time, index) => {
        return {
            timestamp: time * 1000,
            iconCode: hourly.weathercode[index],
            temp: Math.round(hourly.temperature_2m[index]),
            feelsLike: Math.round(hourly.apparent_temperature[index]),
            windSpeed: Math.round(hourly.windspeed_10m[index]),
            precip: Math.round(hourly.precipitation[index] *100) / 100,
        }
    }).filter(({ timestamp }) => timestamp >= current_weather.time * 1000)
}   //filter through current_weather object and find timestamp - check when timestamp is greater than or equal to the current hour(current_weater.time returns the current hour you are at)

//note:
// const { temperature_2m_max: [maxTemp] } = daily    is the same as doing:
// const maxTemp = daily.temprature_2m_max[0]
//temprature_2m_max is an array of temps - we want the first item which is the most recent temp at index of 0 - and we are storing it as the variable maxTemp - [maxTemp]=labeling index 0 as maxTemp