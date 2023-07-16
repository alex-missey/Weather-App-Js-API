import axios from "axios";

// For our API
// We want all dates in our timezone and need latitude and longitude
// Starting with everything before our query (up to forecast)
// After adding params delete latitude and longitude from link
// Also remove

export function getWeather(lat, lon, timezone) {
    return axios.get(
        "https://api.open-meteo.com/v1/forecast?&hourly=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timeformat=unixtime",
        {
            params: {
                latitude: lat,
                longitude: lon,
                timezone,
            }
        }
    ).then(({ data }) => {
        //return data
        return {
            current: parseCurrentWeather(data),
            daily: parseDailyWeather(data),
            hourly: parseHourlyWeather(data),
        } // Created 3 functions to parse out this data so we will build a function below
    })
}

function parseCurrentWeather({ current_weather, daily }) {
    const {
        temperature: currentTemp,
        windSpeed: windSpeed,
        weathercode: iconCode
    } = current_weather
    const {
        temperature_2m_max: [maxTemp], // array
        temperature_2m_min: [minTemp],
        apparent_temperature_max: [maxFeelsLike],
        apparent_temperature_min: [minFeelsLike],
        precipitation_sum: [precip],

    } = daily

    // **********ABOVE IS SAME AS THIS***************
    // const maxTemp = daily.temperature_2m_max[0]


    // Want to round off temps (no decimals)
    return {
        currentTemp: Math.round(currentTemp),
        highTemp: Math.round(maxTemp),
        lowTemp: Math.round(minTemp),
        highFeelsLike: Math.round(maxFeelsLike),
        lowFeelsLike: Math.round(minFeelsLike),
        windSpeed: Math.round(windSpeed),
        precip: Math.round(precip * 100) / 100, // Rounds to nearest hundredth
        iconCode,
    } // These are the different things we need to get from the API ^^^
}

function parseDailyWeather({ daily }) {
    return daily.time.map((time, index) => {
        // Loop through object, get time value (array) and map over that array (time value)
        return { // returns object containing data we need (date, temp, and icon)
            timestamp: time * 1000, // need timestamp in ms for JS
            iconCode: daily.weathercode[index], // want value at current index (day 1 etc)
            maxTemp: Math.round(daily.temperature_2m_max[index])
        }
    })
}

function parseHourlyWeather({ hourly, current_weather }) {
    // need current weather to know what hour to start at
    return hourly.time.map((time, index) => {
        return {
            timestamp: time * 1000,
            iconCode: hourly.weathercode[index],
            temp: Math.round(hourly.temperature_2m[index]),
            feelsLike: Math.round(hourly.apparent_temperature[index]),
            windSpeed: Math.round(hourly.windspeed_10m[index]),
            precip: Math.round(hourly.precipitation[index] * 100) / 100, // extra precision on rounding
            // haven't filtered what our current time is using current_weather yet

        }
    }).filter(({ timestamp }) => timestamp >= current_weather.time * 1000)
}
