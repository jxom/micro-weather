const includes = require('lodash/includes');
const get = require('lodash/get');

const CONDITIONS = [
  'STORM',
  'THUNDERSTORMS',
  'RAIN',
  'SNOW',
  'DRIZZLE',
  'SHOWERS',
  'HAIL',
  'WINDY',
  'COLD',
  'SUNNY',
  'HOT'
];
const HIGH_WIND_THRESHOLD = 30;
const TEMP_THRESHOLDS = {
  VERY_HOT: 40,
  HOT: 25,
  MILD: 20,
  COLD: 10,
  VERY_COLD: 0,
}
const OUTFITS = {
  HEAD: {
    DEFAULT: null,
    TEMP: {
      COLD: 'beanie',
      VERY_COLD: 'beanie'
    },
    CONDITION: {
      SNOW: 'beanie',
      COLD: 'beanie',
      HOT: 'hat'
    }
  },
  TORSO: {
    DEFAULT: 't-shirt',
    TEMP: {
      VERY_HOT: [['singlet'], ['t-shirt']],
      HOT: 't-shirt',
      MILD: [['long-sleeve shirt'], ['t-shirt']],
      COLD: 'jumper',
      VERY_COLD: [['heavy jumper', 'thermals']]
    },
    CONDITION: {
      THUNDERSTORMS: 'jacket',
      RAIN: 'jacket',
      SNOW: 'snow jacket',
      DRIZZLE: 'jacket',
      SHOWERS: 'jacket',
      HAIL: 'jacket',
      WINDY: 'windbreaker',
      COLD: 'jumper',
      THUNDERSHOWERS: 'jacket',
      STORM: 'jacket'
    }
  },
  PANTS: {
    DEFAULT: 'pants',
    TEMP: {
      VERY_HOT: 'short shorts',
      HOT: 'shorts',
      MILD: 'pants',
      COLD: 'pants',
      VERY_COLD: [['pants', 'thermals']]
    }
  },
  FEET: {
    DEFAULT: 'shoes',
    TEMP: {
      VERY_HOT: [['thongs'], ['sandals'], ['crocs']],
      HOT: [['thongs'], ['sandals'], ['crocs']],
      MILD: 'shoes',
      COLD: 'shoes',
      VERY_COLD: 'shoes'
    },
    CONDITION: {
      THUNDERSTORMS: 'gumboots',
      RAIN: 'gumboots',
      SNOW: 'snow boots',
      SHOWERS: 'gumboots',
      HAIL: 'gumboots',
      HOT: [['thongs'], ['sandals'], ['crocs']],
      THUNDERSHOWERS: 'gumboots',
      STORM: 'gumboots'
    }
  },
};

const getOutfit = (currentOutfit = {}, key = 'DEFAULT') => ({
  head: get(OUTFITS.HEAD, key, currentOutfit.head),
  torso: get(OUTFITS.TORSO, key, currentOutfit.torso),
  pants: get(OUTFITS.PANTS, key, currentOutfit.pants),
  feet: get(OUTFITS.FEET, key, currentOutfit.feet),
})

const predictOutfit = ({ windSpeed, condition, highTemp }) => {
  let outfit = getOutfit({}, 'DEFAULT');

  if (highTemp >= TEMP_THRESHOLDS.VERY_HOT) {
    outfit = getOutfit(outfit, 'TEMP.VERY_HOT');
  } else if (highTemp >= TEMP_THRESHOLDS.HOT) {
    outfit = getOutfit(outfit, 'TEMP.HOT');
  } else if (highTemp >= TEMP_THRESHOLDS.MILD) {
    outfit = getOutfit(outfit, 'TEMP.MILD');
  } else if (highTemp >= TEMP_THRESHOLDS.COLD) {
    outfit = getOutfit(outfit, 'TEMP.COLD');
  } else if (highTemp >= TEMP_THRESHOLDS.VERY_COLD) {
    outfit = getOutfit(outfit, 'TEMP.VERY_COLD');
  } else {
    outfit = getOutfit(outfit, 'TEMP.VERY_COLD');
  }

  CONDITIONS.forEach(cond => {
    if (condition.includes(cond.toLowerCase())) {
      outfit = getOutfit(outfit, `CONDITION.${cond}`);
      return;
    }
  });

  if (windSpeed > HIGH_WIND_THRESHOLD) {
    outfit = getOutfit(outfit, 'CONDITION.WINDY');
  }

  return outfit;
}

module.exports = predictOutfit;
