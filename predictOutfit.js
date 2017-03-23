const includes = require('lodash/includes');
const get = require('lodash/get');

const CLOTHES = require('./clothes');

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
      COLD: CLOTHES.BEANIE,
      VERY_COLD: CLOTHES.BEANIE,
    },
    CONDITION: {
      SNOW: CLOTHES.BEANIE,
      COLD: CLOTHES.BEANIE,
      HOT: CLOTHES.HAT,
    }
  },
  TORSO: {
    DEFAULT: CLOTHES.T_SHIRT,
    TEMP: {
      VERY_HOT: [[CLOTHES.SINGLET], [CLOTHES.T_SHIRT]],
      HOT: CLOTHES.T_SHIRT,
      MILD: [[CLOTHES.LONG_SLEEVE_SHIRT], [CLOTHES.T_SHIRT]],
      COLD: CLOTHES.JUMPER,
      VERY_COLD: [[CLOTHES.SNOW_JACKET, CLOTHES.THERMALS]]
    },
    CONDITION: {
      THUNDERSTORMS: CLOTHES.JACKET,
      RAIN: CLOTHES.JACKET,
      SNOW: CLOTHES.SNOW_JACKET,
      DRIZZLE: CLOTHES.JACKET,
      SHOWERS: CLOTHES.JACKET,
      HAIL: CLOTHES.JACKET,
      WINDY: CLOTHES.WINDBREAKER,
      COLD: CLOTHES.JUMPER,
      THUNDERSHOWERS: CLOTHES.JACKET,
      STORM: CLOTHES.JACKET
    }
  },
  PANTS: {
    DEFAULT: CLOTHES.PANTS,
    TEMP: {
      VERY_HOT: CLOTHES.SHORTS,
      HOT: CLOTHES.SHORTS,
      MILD: CLOTHES.PANTS,
      COLD: CLOTHES.PANTS,
      VERY_COLD: [[CLOTHES.PANTS, CLOTHES.THERMALS]]
    }
  },
  FEET: {
    DEFAULT: CLOTHES.SHOES,
    TEMP: {
      VERY_HOT: [[CLOTHES.THONGS], [CLOTHES.SANDALS], [CLOTHES.CROCS]],
      HOT: [[CLOTHES.THONGS], [CLOTHES.SANDALS], [CLOTHES.CROCS]],
      MILD: CLOTHES.SHOES,
      COLD: CLOTHES.SHOES,
      VERY_COLD: CLOTHES.SHOES
    },
    CONDITION: {
      THUNDERSTORMS: CLOTHES.GUMBOOTS,
      RAIN: CLOTHES.GUMBOOTS,
      SNOW: CLOTHES.SNOW_BOOTS,
      SHOWERS: CLOTHES.GUMBOOTS,
      HAIL: CLOTHES.GUMBOOTS,
      HOT: [[CLOTHES.THONGS], [CLOTHES.SANDALS], [CLOTHES.CROCS]],
      THUNDERSHOWERS: CLOTHES.GUMBOOTS,
      STORM: CLOTHES.GUMBOOTS
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
    if (condition.toLowerCase().includes(cond.toLowerCase())) {
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
