const { send } = require('micro');
const microApi = require('micro-api');
const moment = require('moment');
const YQL = require('yqlp');

const predictOutfit = require('./predictOutfit');

const BASE_URL = 'https://query.yahooapis.com/v1/public';
const USAGE_TEXT = 'Gets the current (or tomorrow, or D/MM) weather conditions!\n\nUsage:\n\n\nGET /?text=<suburb,town,city,state>\nE.g. /?text=Melbourne, Victoria\n\nGET /?lat=<latitude>&lng=<longitude>\nE.g. /?lat=-37&lng=145';

const yqlSelectForecastQuery = (whereText, offset = 0) => `select location, wind, atmosphere, item.condition, item.forecast from weather.forecast where woeid in (select woeid from geo.places where text="${whereText}") LIMIT 1 OFFSET ${offset}`;
const fahrenheitToCelcius = (tempFahrenheit) => ((tempFahrenheit - 32) * (5/9));

const parseResult = ({ channel: { location, wind, atmosphere, item } }) => ({
  location,
  current: {
    date: item.condition.date,
    windSpeed: wind.speed,
    humidity: atmosphere.humidity,
    tempCelcius: fahrenheitToCelcius(item.condition.temp).toFixed(0),
    tempFahrenheit: item.condition.temp,
    condition: item.condition.text,
  },
  day: {
    date: item.forecast.date,
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    let recordOffset = 0;
    let diff;
    if (params.when && params.when !== 'today') {
      if (params.when === 'tomorrow') {
        recordOffset = 2;
      } else if (moment(params.when, 'D/MM').isValid()) {
        diff = moment.utc(params.when, 'D/MM').diff(moment.utc().startOf('day'), 'days');
        recordOffset = diff + 1;
      } else {
        return send(res, 400, { error: 'Query parameter \'when\' accepts only: `today`, `tomorrow`, or `{D/MM}` (date)' });
      }
    }

    let yqlResp;
    if (params.text) {
      yqlResp = await YQL.execp(yqlSelectForecastQuery(params.text, recordOffset));
    } else if (params.lat && params.lng) {
      yqlResp = await YQL.execp(yqlSelectForecastQuery(`(${params.lat},${params.lng})`, recordOffset));
    } else {
      return USAGE_TEXT;
    }

    if (yqlResp.query.count === 0) {
      return {};
    }

    const response = parseResult(yqlResp.query.results);
    if (params.getOutfitPrediction && JSON.parse(params.getOutfitPrediction)) {
      response.outfitPrediction = predictOutfit({
        windSpeed: response.current.windSpeed,
        condition: response.day.condition,
        highTemp: response.day.high.tempCelcius,
      });
    }
    return response;
  } catch (e) {
    return send(res, 500, { error: 'Oops, we dun goof. An internal error occured. 😔🔫' });
  }
};

const api = microApi([
  {
    method: 'get',
    path: '/',
    handler: handleGetWeather,
  }
]);

module.exports = api;
