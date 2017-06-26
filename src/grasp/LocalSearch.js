export default {
  setup: {},
  search (data, setup) {
    this.setup = setup
    setup = null
    var instances = data
    return data
  }
}
