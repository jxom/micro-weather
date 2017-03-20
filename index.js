const { send } = require('micro');
const microApi = require('micro-api');
const YQL = require('yqlp');

const BASE_URL = 'https://query.yahooapis.com/v1/public';
const USAGE_TEXT = 'Usage:\n\n\nGET /?text=<suburb,town,city,state>\nE.g. /?text=Melbourne, Victoria\n\nGET /?lat=<latitude>&lng=<longitude>\nE.g. /?lat=-37&lng=145';

const ymlSelectForecastQuery = (whereText) => `select location, wind, atmosphere, item.condition, item.forecast from weather.forecast where woeid in (select woeid from geo.places where text="${whereText}") LIMIT 1`;
const fahrenheitToCelcius = (tempFahrenheit) => ((tempFahrenheit - 32) * (5/9));

const parseResult = ({ channel: { location, wind, atmosphere, item } }) => ({
  location,
  current: {
    windSpeed: wind.speed,
    humidity: atmosphere.humidity,
    tempCelcius: fahrenheitToCelcius(item.condition.temp).toFixed(0),
    tempFahrenheit: item.condition.temp,
    condition: item.condition.text,
  },
  today: {
    low: {
      tempCelcius: fahrenheitToCelcius(item.forecast.low).toFixed(0),
      tempFahrenheit: item.forecast.low,
    },
    high: {
      tempCelcius: fahrenheitToCelcius(item.forecast.high).toFixed(0),
      tempFahrenheit: item.forecast.high,
    },
    condition: item.forecast.text,
  }
});

const handleGetWeather = async ({ params, res }) => {
  try {
    let yqlResp;
    if (params.text) {
      yqlResp = await YQL.execp(ymlSelectForecastQuery(params.text));
    } else if (params.lat && params.lng) {
      yqlResp = await YQL.execp(ymlSelectForecastQuery(`(${params.lat},${params.lng})`));
    } else {
      return USAGE_TEXT;
    }

    if (yqlResp.query.count === 0) {
      return {};
    }
    return parseResult(yqlResp.query.results);
  } catch (e) {
    return send(res, 500, 'Oops, we dun goof. An internal error occured. 😔🔫');
  }
}

const api = microApi([
  {
    method: 'get',
    path: '/',
    handler: handleGetWeather,
  },
]);

module.exports = api;
