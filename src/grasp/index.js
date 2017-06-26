import performance from 'performance-now'
import LocalSearch from './LocalSearch.js'
import LRC from './LRC'

export default {
  name: 'Graps Project',
  setup: {},
  solucao: {},
  aproveitamento: {},
  maxIterations: 10000,
  run (data) {
    let start = performance()
    let spaceTotal = { // R
      _width: data.body.setup.widthBin,
      _length: data.body.setup.lengthBin
    }

    let solution = null // S*
    let exploitation = null // aprovS*

    for (let i = 0; i < this.maxIterations; i++) {
      let _solution = 0 // S
      let _exploitation = 0 // S
      let _items = data.body.items.slice(i) // C
      let j = i

      while (_items.length > 0) {
        j++
        let _items_ = _items.slice(j) // C'
        let standardCut = [] // padcorte(G)
        let parcialSpaceCut = spaceTotal // Rf

        let setBetterChoiceLength = [] // Bh
        let setBetterChoiceWidth = [] // Bv

        while (_items_.length > 0) {
          let alpha = 0.3

          // Parammetros para LRC
          let arrRandom =[]

          // LRC p/ corte horizontal
          let maxLength = this.getMaxLengthFromItems(_items_)
          let alphaLenght = aplha*maxLength
          let lLRC = null
          let lRandomId = 0
          while (_items_.length >= arrRandom.length) {
            lRandomId = utils.getRandomInt(0, _items_.length)
            if (arrRandom.indexOf(lRandomId) >= 0)
              continue

            if (_items_[lRandomId].lengthBin >= alphaLenght && _items_[lRandomId].lengthBin <= maxLength) {
              lLRC = _items_[lRandomId]
              break
            }
          }

          // LRC p/ corte vertical
          arrRandom =[]
          let wLRC = null
          let maxWidth = this.getMaxWidthFromItems(_items_)
          let alphaWidth = aplha*maxWidth
          let wRandomId = 0
          while (_items_.length >= arrRandom.length) {
            let wRandomId = utils.getRandomInt(0, _items_.length)
            if (arrRandom.indexOf(wRandomId) >= 0)
              continue

            if (_items_[wRandomId].widthBin >= alphaWidth && _items_[wRandomId].widthBin <= maxWidth) {
              wLRC = _items_[wRandomId]
              break
            }
          }

          // Construindo Bh e Bv
          setBetterChoiceLength.push(lLRC)
          setBetterChoiceWidth.push(wLRC)

          // Melhorando Fh e Fv
          let sliceLengthLine = null // Fh
          let sliceWidthLine = null // Fv

          // Fh
          let bestRateLength = 0
          if (setBetterChoiceLength.length > 0) {
            for (let b of setBetterChoiceLength) {
              if (sliceLengthLine === null) {
                sliceLengthLine = b
                bestRateLength = sliceLengthLine.lengthBin / parcialSpaceCut._length
              } else if ((b.lengthBin / parcialSpaceCut._length) > (sliceLengthLine.lengthBin / parcialSpaceCut._length )) {
                // Pegando aquele que tem a menor perda: 10px, cortando no 9 px, eu tenho 1 px de sobra.
                sliceLengthLine = b
                bestRateLength = sliceLengthLine.lengthBin / parcialSpaceCut._length
              }
            }

            // Atualize BH, MFH, perdaintFH, BV, MFH e perdaintFH;
            let subSetAreaCutL = { // MFV
              _width: parcialSpaceCut._width,
              _length: sliceLengthLine.lengthBin
            }
          }

          // Fv
          let bestRateWidth = 0
          if (setBetterChoiceWidth.length > 0) {
            for (let b of setBetterChoiceWidth) {
              if (sliceWidthLine === null) {
                sliceWidthLine = b
                bestRateWidth = sliceWidthLine.widthBin / parcialSpaceCut._width
              } else if ((b.widthBin / parcialSpaceCut._width) > (sliceWidthLine.widthBin / parcialSpaceCut._width )) {
                // Pegando aquele que tem a menor perda: 10px, cortando no 9 px, eu tenho 1 px de sobra.
                sliceWidthLine = b
                bestRateWidth = sliceWidthLine.widthBin / parcialSpaceCut._width
              }
            }

            // Atualize BH, MFH, perdaintFH, BV, MFH e perdaintFH;
            let subSetAreaCutW = { // MFH
              _width: sliceWidthLine.widthBin,
              _length: parcialSpaceCut._length
            }
          }

          // Determine perdaintFmelhor = min {perdaintFH /v(FH), perdaintFH/v(FH)};
          // Inclua Fmelhor, associada à perdaintFmelhor,
          // padcorte(g) = padcorte(g) {Fmelhor};
          if (bestRateLength > bestRateWidth) {
            // Atualize C’ e RF = RF - Fmelhor;
            standardCut.push(sliceLengthLine)
            _items_.splice(lRandomId, 1)
            parcialSpaceCut._width = parseInt(parcialSpaceCut._width) - parseInt(sliceLengthLine._width)
            parcialSpaceCut._length = parseInt(parcialSpaceCut._length) - parseInt(sliceLengthLine._length)
          }
          else {
            standardCut.push(sliceWidthLine)
            _items_.splice(wRandomId, 1)
          }

        }
      }
    }



    // let _lrc = LRC.generateRandomSolution(_items, data.body.setup)

    // let remaining = _lrc[1]
    // _lrc = _lrc[0]
    // if (!_lrc || _lrc === undefined || _lrc === 'undefined')
    //   return 'ERROR - No data was sent or the data are wrong.'

    // let items = LocalSearch.search(_lrc, this.setup)
    // let timespent = performance() - start
    let result = {
      timespent: timespent,
      setup: this.setup,
      items: items,
      itemsRemaining: remaining
    }
    return result
  },
  getMaxLengthFromItems(items) {
    let max = 0
    for (let item of items)
      if (item.lengthBin > max)
        max = item.lengthBin

    return max
  },
  getMaxWidthFromItems(items) {
    let max = 0
    for (let item of items)
      if (item.lengthBin > max)
        max = item.widthBin

    return max
  }
}
