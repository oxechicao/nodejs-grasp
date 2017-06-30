import utils from '../utils'

export default {
  setup: {},
  maxHeight: 0,
  randomSolutions: [],
  maxLength: [],
  graspItems: [],
  count: 0,
  getLRC (items, setup, max, alpha) {
    let _items = JSON.parse(JSON.stringify(items))
    let randomId = 0
    while (_items.length > 0) {
      randomId = utils.getRandomInt(0, _items.length)
      let _item = _items[randomId]
      let area = _item.widthBin * _item.lengthBin

      if (alpha <= area && area <= max) {
        return _item
      }

      _items.splice(randomId, 1)
    }

    return false
  }
}
