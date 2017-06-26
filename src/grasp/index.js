import performance from 'performance-now'
import LocalSearch from './LocalSearch.js'
import utils from '../utils'
import LRC from './LRC'

export default {
  name: 'Graps Project',
  setup: {},
  solucao: {},
  aproveitamento: {},
  maxIterations: 1000,
  run (data) {
    let start = performance()
    console.log('start running')
    if (utils.isVoid(data.body) || utils.isVoid(data.body.setup) || utils.isVoid(data.body.items))
      return 'No data was sent'

    this.setup = data.body.setup
    let spaceTotal = { // R
      _width: this.setup.widthBin,
      _length: this.setup.lengthBin
    }

    let solution = [] // S*
    let exploitation = 0 // aprovS*

    for (let i = 0; i < this.maxIterations; i++) {
      console.log('I: ' + i)
      console.log(solution)
      console.log(exploitation)

      let _solution = [] // S
      let _exploitation = 0 // aprovS*
      let _items = data.body.items.slice(i) // C
      let j = i
      while (_items.length > 0) {
        console.log('_items.length: ' + _items.length)
        console.log(_items)
        let _items_ = _items.slice(1) // C'
        let standardCut = [] // padcorte(G)
        let parcialSpaceCut = spaceTotal // Rf

        let setBetterChoiceLength = [] // Bh
        let setBetterChoiceWidth = [] // Bv
        let subSetAreaCutW = null // MFh
        let subSetAreaCutL = null // MFv
        let bestRandomId = 0
        while (_items_.length > 0) {
          // console.log('_items_.length: ' + _items_.length)
          let alpha = 0.3

          // Parammetros para LRC
          let arrRandom =[]

          // LRC p/ corte horizontal
          let maxLength = this.getMaxLengthFromItems(_items_)
          let alphaLenght = alpha*maxLength
          let lLRC = null
          let lRandomId = 0
          console.log('maxLength: ' + maxLength)
          while (_items_.length >= arrRandom.length) {
            lRandomId = utils.getRandomInt(0, _items_.length)
            if (arrRandom.indexOf(lRandomId) >= 0) {
              continue
            }

            arrRandom.push(lRandomId)
            if (_items_[lRandomId].lengthBin >= alphaLenght && _items_[lRandomId].lengthBin <= maxLength) {
              lLRC = _items_[lRandomId]
              break
            }
          }

          console.log(lLRC)

          // LRC p/ corte vertical
          arrRandom =[]
          let wLRC = null
          let maxWidth = this.getMaxWidthFromItems(_items_)
          let alphaWidth = alpha*maxWidth
          let wRandomId = 0
          while (_items_.length >= arrRandom.length) {
            let wRandomId = utils.getRandomInt(0, _items_.length)
            if (arrRandom.indexOf(wRandomId) >= 0) {
              continue
            }

            arrRandom.push(wRandomId)
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

          // Melhorando Fh
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
            subSetAreaCutL = { // MFV
              _width: parcialSpaceCut._width,
              _length: sliceLengthLine.lengthBin
            }
          }

          // Melhorando Fv
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

            // Atualize Bv, MFv, perdaintFH, BV, MFH e perdaintFH;
            subSetAreaCutW = { // MFH
              _width: sliceWidthLine.widthBin,
              _length: parcialSpaceCut._length
            }
          }

          // Determine perdaintFmelhor = min {perdaintFH /v(FH), perdaintFH/v(FH)};
          if (bestRateLength > bestRateWidth) {
            standardCut.push(sliceLengthLine) // padcorte(g) = padcorte(g) {Fmelhor};
            _items_.splice(lRandomId, 1) // Atualizando C'
            _exploitation = bestRateLength // Atualizando aprovS*
            bestRandomId = lRandomId > 0 ? (lRandomId - 1) : 0

            // Atualizando RF = RF - Fmelhor;
            parcialSpaceCut._width = parseInt(parcialSpaceCut._width) - parseInt(subSetAreaCutL._width)
            parcialSpaceCut._length = parseInt(parcialSpaceCut._length) - parseInt(subSetAreaCutL._length)
          }
          else {
            standardCut.push(sliceWidthLine) // padcorte(g) = padcorte(g) {Fmelhor};
            _items_.splice(wRandomId, 1) // Atualizando C'
            _exploitation = bestRateWidth  // Atualizando aprovS*
            bestRandomId = wRandomId > 0 ? (wRandomId - 1) : 0

             // Atualizando RF = RF - Fmelhor;
            parcialSpaceCut._width = parseInt(parcialSpaceCut._width) - parseInt(subSetAreaCutW._width)
            parcialSpaceCut._length = parseInt(parcialSpaceCut._length) - parseInt(subSetAreaCutW._length)
          }
        } // end of while (_item_.lengnth > 0)

        _solution.push(standardCut) // S = S padcorte (g) ;
        _items.splice(bestRandomId) // // Atualize C;
      } // end of WHILE (_items.length > 0)

      // calcula aprovS = soma(v(pi))/g*v(R)
      if (_exploitation > exploitation) {
        exploitation = _exploitation
        solution = _solution
      }
    } // end of FOR


    // let _lrc = LRC.generateRandomSolution(_items, data.body.setup)
    // let remaining = _lrc[1]
    // _lrc = _lrc[0]
    // if (!_lrc || _lrc === undefined || _lrc === 'undefined')
    //   return 'ERROR - No data was sent or the data are wrong.'
    // let items = LocalSearch.search(_lrc, this.setup)

    let timespent = performance() - start
    let result = {
      timespent: timespent,
      setup: this.setup,
      items: solution,
      exploitation: exploitation
      // itemsRemaining: remaining
    }
    return result
  },
  getMaxLengthFromItems(items) {
    let max = 0
    for (let item of items) {
      if (item.lengthBin > max) {
        max = item.lengthBin
      }
    }

    return max
  },
  getMaxWidthFromItems(items) {
    let max = 0
    for (let item of items) {
      if (item.widthBin > max) {
        max = item.widthBin
      }
    }

    return max
  }
}
