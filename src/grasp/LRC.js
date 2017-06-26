import utils from '../utils'

export default {
  setup: {},
  maxHeight: 0,
  randomSolutions: [],
  maxLength: [],
  graspItems: [],
  count: 0,
  generateRandomSolution (items, setup) {
    if (!items)
      return false

    this.graspItems = items
    this.setup = setup
    setup = null
    if (!items || items === undefined || items === 'undefined')
      return false

    while((this.progressLengthCondition || this.graspItems.length == 0) && this.graspItems.length != 0) {
      let line = this.getLine([])
      this.maxLength.push(utils.getMaxFromArray(line))
      this.randomSolutions.push(line)
    }

    return [this.randomSolutions, this.graspItems.length]
  },
  getLine(line) {
    while ((this.progressLineWidthCondition(line) || line.length == 0) && this.graspItems.length != 0) {
      let randomIndex = utils.getRandomInt(0, this.graspItems.length)
      let randomItem = this.graspItems[randomIndex]
      this.graspItems.splice(randomIndex, 1)
      this.graspItems = this.graspItems
      line.push(randomItem)
    }

    return line
  },
  pushMaxLength(line) {
    this.maxLenth.push(utils.getMaxFromArray(line))
  },
  progressLineWidthCondition (line) {

    if (!line || line.length <= 0)
      return false

    let sumWidth = 0
    for (let item of line) {
      sumWidth += parseInt(item.widthBin)
    }

    // console.log(sumWidth + ' ' + this.setup.widthBin)
    return sumWidth >= this.setup.widthBin
  },
  progressLengthCondition () {
    return utils.getSumArray(this.maxLength) >= this.setup.lengthBin
  }

}
