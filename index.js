const urlLiveTemperature = "http://www.yr.no/place/Norway/Hordaland/Bergen/Bergen/varsel_nu.xml"
const urlForecast = "https://www.yr.no/place/Norway/Hordaland/Bergen/Bergen/forecast.xml"

const parseString = require('util').promisify(require('xml2js').parseString)
const hue = require('./lib/hue')
const fetch = require('node-fetch')

const a = fetch(urlLiveTemperature)
const b = fetch(urlForecast)

Promise.all([a, b])
    .then(res => Promise.all(res.map(ele => ele.text())))
    .then((bodies) => Promise.all(bodies.map(ele => parseString(ele, {trim: true}))))
    .then(function (results) {
        const firstItem = results[0].weatherdata.forecast[0].time[0].precipitation[0].$
        const value = parseFloat(firstItem.value)
        const unit = firstItem.unit

        const temperature = results[1].weatherdata.forecast[0].tabular[0].time[0].temperature[0].$.value

        console.log(value)

        hue(`--color ${temperatureToSubjectiveColorname(temperature)} --number 3`)

        if (!true) {
            if (value === 0) {
                hue("--color green --number 3")
            } else if (value >= 0 && value <= 2) {
                hue("--color yellow --number 3")
            } else if (value > 2 && value <= 4) {
                hue("--color orange --number 3")
            } else {
                console.warn("RED")
                hue("--color red --number 3")
            }
        }

        console.log(`At present rain is falling at ${value} ${unit} in Bergen, and the temperature is ${temperature}`)
        process.exit(0)
    })
    .catch(console.warn)

/**
 *
 * @param {number} celsiusTemperature
 */
function temperatureToSubjectiveColorname(celsiusTemperature) {
    const tmp = celsiusTemperature
    console.log(tmp)
    if (tmp <= 0) {
        return "blue"
    } else if (tmp <= 5) {
        return "purple"
    } else if (tmp <= 10) {
        return "green"
    } else if (tmp <= 15) {
        return "yellow"
    } else if (tmp <= 20) {
        return "red"
    }
}
