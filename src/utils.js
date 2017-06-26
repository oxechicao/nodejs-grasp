export default {
  getRandomInt (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  },
  getSumArray (_array) {
    return _array.reduce((acc, val) => {
        return acc + val;
      },
      0)
  },
  getMaxFromArray (_array) {
    return _array.reduce((acc, val) => {
        if (acc >= val)
          return acc
        else
          return val
      }, 0)
  },
  isVoid(value) {
    return (!value || value === undefined || value === '')
  }
}
