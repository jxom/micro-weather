# Micro Weather
A micro-service that gets the current weather conditions using the [Yahoo Weather API](https://developer.yahoo.com/weather/)!

Visit [https://climate.now.sh/](https://climate.now.sh/)

## Usage

### `GET /`

Display current weather conditions.

Available query parameters:

- `text` - Location text (E.g. `/?text=Melbourne, Victoria`)
- `lat` and `lng` - Coordinates (E.g. `/?lat=-37&lng=145`)

## Deploy
[![Deploy to now](https://deploy.now.sh/static/button.svg)](https://deploy.now.sh/?repo=https://github.com/jxom/micro-weather)

```
now jxom/micro-weather
```
