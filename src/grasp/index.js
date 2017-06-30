import performance from 'performance-now'
import LocalSearch from './LocalSearch.js'
import utils from '../utils'
import LRC_Lib from './LRC'

export default {
  name: 'Graps Project',
  maxIterations: 100000,
  setup: {},
  solucao: [],
  solution: [],
  aproveitamento: {},
  menorPerda: Infinity,
  _menorPerda: Infinity,
  spaceTotal: 0,
  areaTotal: 0,
  _solution: [],
  _items: {},
  _items_: {},
  standardCut: [],
  parcialSpaceCut: [],
  pecasMelhoriasH: [],
  pecasMelhoriasV: [],
  alpha: 0,
  max: 0,
  alphaMax: 0,
  LRC: 0,
  faixaCorteHorizontal: 0,
  faixaCorteVertical: 0,
  areaRestanteFh: 0,
  areaRestanteFv: 0,
  Perdas_S: 0,
  melhorSolucaoParcial: 0,
  totalPerdaPerc: 0,
  sumTotalAreasItems: 0,
  wrapperRun (data) {
    let i = []
    for (let c = 1; c <= 3; c++) {
      i.push(this.run(data))
    }

    return i

  },
  run (data) {
    let start = performance()
    console.log('start running')
    if (utils.isVoid(data.body) || utils.isVoid(data.body.setup) || utils.isVoid(data.body.items)) {
      return 'No data was sent'
    }

    this.setup = utils.clonar(data.body.setup)
    this.maxIterations = this.setup.iterations
    this.spaceTotal = { // R
      _width: this.setup.widthBin,
      _length: this.setup.lengthBin
    }
    this.areaTotal = this.spaceTotal._length * this.spaceTotal._width
    for (let i of data.body.items) {
      this.sumTotalAreasItems += (i.widthBin * i.lengthBin)
    }

    this.solution = [] // S*
    this.menorPerda = Infinity
    for (let i = 0; i < this.maxIterations; i++) {
      this._solution = []
      this.melhorSolucaoParcial = []
      this._items = utils.clonar(data.body.items.slice(i)) // C
      this._menorPerda = Infinity
      this.melhorSolucaoParcial = null

      while (this._items.length > 0) {
        this._items_ = utils.clonar(this._items.slice(1)) // C'
        this.standardCut = [] // padcorte(G)
        this.parcialSpaceCut = utils.clonar(this.spaceTotal) // Rf

        this.pecasMelhoriasH = [] // Bh
        this.pecasMelhoriasV = [] // Bv
        while (this._items_.length > 0) {
          this.alpha = 0.2

          // Parammetros para LRC

          // LRC p/ corte horizontal
          this.max = this.getMaxAreaItems(utils.clonar(this._items_))
          this.alphaMax = this.alpha*this.max
          this.LRC = LRC_Lib.getLRC(utils.clonar(this._items_), utils.clonar(this.setup), this.max, this.alphaMax)

          // Melhorando Fh e Fv
          this.faixaCorteHorizontal = {
            _length: this.LRC.lengthBin,
            _width: this.parcialSpaceCut._width
          } // Fh - Melhor faixa de corte horizontal onde há a menor perda (soma dos conjuntos)
          this.faixaCorteVertical = {
            _length: this.parcialSpaceCut._length,
            _width: this.LRC.widthBin
          } // Fv - Melhor faixa de corte vertical onde há a menor perda (soma dos conjuntos)

          // Construindo Bh
          this.pecasMelhoriasH = this.removerItemsForaDoCorte(utils.clonar(this._items_), utils.clonar(this.faixaCorteHorizontal))
          if (this.pecasMelhoriasH !== undefined && this.pecasMelhoriasH.length > 0) {
            this.areaRestanteFh = {
              _length: this.faixaCorteHorizontal._length,
              _width: (this.faixaCorteHorizontal._width - this.LRC.widthBin)
            } //MH
            // MELHORANDO COM A MINIMA PERDA { items: [], perda: number }
            this.pecasMelhoriasH = LocalSearch.search(utils.clonar(this.pecasMelhoriasH), utils.clonar(this.areaRestanteFh), true)
          }
          // console.log('HHHHHHHHHHHHHHHHHHHHHH')
          // console.log(this.pecasMelhoriasH)
          // console.log('HHHHHHHHHHHHHHHHHHHHHH')
          // Construindo Bv
          this.pecasMelhoriasV = this.removerItemsForaDoCorte(utils.clonar(this._items_), utils.clonar(this.faixaCorteVertical))
          if (this.pecasMelhoriasV !== undefined && this.pecasMelhoriasV.length > 0) {
            this.areaRestanteFv = {
              _width: this.faixaCorteHorizontal._width,
              _length: (this.faixaCorteHorizontal._length - this.LRC.lengthBin)
            } //MH
            // MELHORANDO COM A MINIMA PERDA { items: [], perda: number }
            this.pecasMelhoriasV = LocalSearch.search(utils.clonar(this.pecasMelhoriasH), utils.clonar(this.areaRestanteFv, false))
          }

          this.pecasMelhoriasV = false
          // ATUALIZANDO C' : _items_ removendo os items da melhor solução encontrada
          if (this.pecasMelhoriasH && typeof(this.pecasMelhoriasH) !== "undefined" && this.pecasMelhoriasH !== undefined && this.pecasMelhoriasH.length != 0 && this.pecasMelhoriasV && typeof(this.pecasMelhoriasV) !== "undefined" && this.pecasMelhoriasV !== undefined && this.pecasMelhoriasV.length != 0) {
            // console.log('TEM EH OS DOIS! YEY!')
            if (this.pecasMelhoriasH.perda <= this.pecasMelhoriasV.perda) {
              // console.log('this.pecasMelhoriasH')

              this._items_ = this.removerItemsSolucao(utils.clonar(this._items_), utils.clonar(this.pecasMelhoriasH.items))
              // Atualizando Rf
              this.parcialSpaceCut = { //CORTE HORIZONTAL
                _length: (this.parcialSpaceCut._length - this.faixaCorteHorizontal._length),
                _width: (this.parcialSpaceCut._width)
              }

              this.pecasMelhoriasH.items.push(utils.clonar(this.LRC))
              this.melhorSolucaoParcial = {
                perda: this.somaDasPerdas_S(utils.clonar(this.pecasMelhoriasH.items)),
                items: utils.clonar(this.pecasMelhoriasH.items),
                horizontal: true
              }
            }
            else {
              // console.log('this.pecasMelhoriasV')
              this._items_ = this.removerItemsSolucao(utils.clonar(this._items_), utils.clonar(this.pecasMelhoriasV.items))
              // Atualizando Rf
              this.parcialSpaceCut = { //CORTE VERTICAL
                _length: (this.parcialSpaceCut._length),
                _width: (this.parcialSpaceCut._width - this.faixaCorteVertical._width)
              }

              this.pecasMelhoriasV.items.push(utils.clonar(this.LRC))
              this.melhorSolucaoParcial = {
                perda: this.somaDasPerdas_S(utils.clonar(this.pecasMelhoriasV.items)),
                items: utils.clonar(this.pecasMelhoriasV.items),
                horizontal: false
              }
            }
          }
          else if (this.pecasMelhoriasH && typeof(this.pecasMelhoriasH !== "undefined") && this.pecasMelhoriasH !== undefined && this.pecasMelhoriasH.length != 0 ) {
            // console.log('this.pecasMelhoriasH         2')
            this._items_ = this.removerItemsSolucao(utils.clonar(this._items_), utils.clonar(this.pecasMelhoriasH.items))
            // Atualizando Rf
            this.parcialSpaceCut = { // CORTE HORIZONTAL
              _length: (this.parcialSpaceCut._length - this.faixaCorteHorizontal._length),
              _width: (this.parcialSpaceCut._width)
            }

            this.pecasMelhoriasH.items.push(utils.clonar(this.LRC))
            this.melhorSolucaoParcial = {
              perda: utils.clonar(this.pecasMelhoriasH.perda),
              items: utils.clonar(this.pecasMelhoriasH.items),
              horizontal: true,
              faixaCorte: utils.clonar(this.faixaCorteHorizontal)
            }
          }
          else if (this.pecasMelhoriasV && typeof(this.pecasMelhoriasV) !== "undefined" && this.pecasMelhoriasV !== undefined && this.pecasMelhoriasV.length != 0) {
            // console.log('this.pecasMelhoriasV         2')
            this.pecasMelhoriasV.items.push(utils.clonar(this.LRC))
            this._items_ = this.removerItemsSolucao(utils.clonar(this._items_), utils.clonar(this.pecasMelhoriasV.items))
            // Atualizando Rf
            this.parcialSpaceCut = { // CORTE VERTICAL
              _length: (this.parcialSpaceCut._length),
              _width: (this.parcialSpaceCut._width - this.faixaCorteVertical._width)

            }

            this.melhorSolucaoParcial = {
              perda: this.somaDasPerdas_S(utils.clonar(this.pecasMelhoriasV.items)),
              items: utils.clonar(this.pecasMelhoriasV.items),
              horizontal: false,
              faixaCorte: utils.clonar(this.faixaCorteVertical)
            }
          }
          else {
            // console.log('LREC EVER')
            this._items_ = this.removerItemsSolucao(utils.clonar(this._items_), utils.clonar([this.LRC]))
            this.melhorSolucaoParcial = {
              perda: (this.spaceTotal._length * this.spaceTotal._width) - (this.LRC.widthBin * this.LRC.lengthBin),
              items: utils.clonar([this.LRC]),
              horizontal: true,
              faixaCorte: utils.clonar(this.faixaCorteHorizontal)
            }

            this.parcialSpaceCut = { // CORTE HORIZONTAL
              _length: (this.parcialSpaceCut._length - this.faixaCorteHorizontal.leng_length),
              _width: (this.parcialSpaceCut._width)
            }
          }
        } // FIM DO WHILE (this._items_.length > 0)

        // console.log('melhor solucao parcial')
        // console.log(this.melhorSolucaoParcial)
        if (this._solution.length == 0) {
          this._solution.push(this.melhorSolucaoParcial) // S = S padcorte (g) ;
        } else {
          var cabe = this.aindaCabe(utils.clonar(this._solution), utils.clonar(this.melhorSolucaoParcial), utils.clonar(this.spaceTotal))
          var menor = this.verificarSeMenorPeso(utils.clonar(this._solution), utils.clonar(this.melhorSolucaoParcial))
          if (cabe || menor) {
            this._solution.push(this.melhorSolucaoParcial)
          }
        }
        this._items.splice(0) // // Atualize C;
      } // end of WHILE (_items.length > 0)

      this.solution.push(this.getMenorPesoDaSolucaoParcial(utils.clonar(this._solution)))

    } // end of FOR

    let x = 0
    for (let s of this.solution) {
      if (!s) {
        this.solution.splice(x)
      }

      x++
    }

    // console.log(this.solution)
    var conjuntoFinal = this.getConjuntoFinal(this.solution, utils.clonar(this.spaceTotal))
    this.menorPerda = conjuntoFinal[1]
    this.timespent = performance() - start
    this.result = {
      timespent: this.timespent,
      setup: this.setup,
      slices: conjuntoFinal[0],
      exploitation: this.menorPerda,
      perdaPerc: (this.menorPerda/this.areaTotal),
      perda: this.menorPerda,
      areaTotal: this.areaTotal
    }

    // console.log('RESULLLLT')
    console.log(this.result)
    return this.result
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
  },
  getSumWidth (items, item = null) {
    let sum = 0
    if (item) {
      sum = item.widthBin
    }

    for (let i of items) {
      sum += i.widthBin
    }

    return sum
  },
  getSumLength (items, item = null) {
    let sum = 0
    if (item) {
      sum = item.lengthBin
    }

    for (let i of items) {
      sum += i.lengthBin
    }

    return sum
  },
  getMaxAreaItems (items) {
    let max = 0
    for (let i of items) {
      let _max = i.widthBin * i.lengthBin
      if (_max > max)
        max = _max
    }

    return max
  },
  removerItemsForaDoCorte(items, faixa) {
    let c = 0
    for (let i of items) {
      if (i.widthBin > faixa._width || i.lengthBin > faixa._length) {
        items.splice(c, 1)
      }

      c++
    }

    return items
  },
  removerItemsSolucao(items, solucao) {
    if (!solucao || solucao === undefined || solucao.length <= 0) {
      return []
    }

    for (let s of solucao) {
      let d = 0
      for (let i of items) {
        if (s.id == i.id) {
          items.splice(d, 1)
          break
        }

        d++
      }
    }

    return items
  },
  somaDasPerdas_S(solucao) {
    if (!solucao || solucao === null || solucao === undefined || solucao.length <= 0) {
      return Infinity
    }

    let sum = 0
    for (let s of solucao) {
      if (!s || s === null) {
        continue
      }

      if (s.perda === Infinity) {
        continue
      }

      sum += s.perda
    }

    if (sum == 0) {
      return Infinity
    }

    return sum
  },
  aindaCabe (s, p, t) {
    if (!p) {
      return false
    }

    var c = 0
    var l = 0
    for (let _s of s) {
      c += _s.faixaCorte.lengthBin
      l += _s.faixaCorte.widthBin
    }
    var _c = t.lengthBin - c
    var _l = t.widthBin - l
    if (p.faixaCorte.lengthBin <= _c || p.faixaCorte.widthBin <= _l) {
      return true
    } else {
      return false
    }

  },
  verificarSeMenorPeso(s, p) {
    if (!p) {
      return false
    }

    for (let _s of s) {
      if (_s.perda >= p.perda) {
        return true
      }
    }

    return false
  },
  getMenorPesoDaSolucaoParcial(s) {
    if (!s) {
      return null
    }

    var min = Infinity
    var i = 0
    var x = 0
    for (let _s of s) {
      if (!_s) {
        x++
        continue
      }
      if (_s.perda <= min) {
        min = _s.perda
        i = x
      }
      // console.log('MINIMO: ' + min + ' < ' + _s.perda)
      x++
    }

    // console.log(s[i])
    return s[i]
  },
  getSomaPerda(s) {
    var sum = 0
    for (let _s of s)
      som += _s.perda

    return sum
  },
  getConjuntoFinal (slices, totalSpace) {
    console.log('GET_CONJUNTO_FINAL')
    var totalArea = totalSpace._width * totalSpace._length
    var solutions = []
    for (let x = 1; x < 3; x++) {
      for (let slice of slices) {
        var parcialSolution = [slice]
        var _slices = utils.clonar(slices)
        while(true) {
          // pegar a menor faixa de corte a partir da faixa de corte testada (slice)
          var ableSlices = this.getAbleSlices(utils.clonar(parcialSolution), utils.clonar(_slices), totalSpace)
          if (ableSlices && ableSlices.length > 0){
            var randomSlice = this.getRandomSlice(utils.clonar(ableSlices))
            if (randomSlice) {
              parcialSolution.push(randomSlice)
            }
          }
          else {
            console.log('BREAK')
            break
          }
        }

        solutions.push(parcialSolution)
      }
    }

    solutions = this.getMinSolution(utils.clonar(solutions), totalArea)
    return solutions
  },
  getMinSolution(solutions, totalArea) {
    var minLose = Infinity
    var idSolution = 0
    var bestSolution = []
    for (let solution of solutions) {
      let areaItems = 0

      for (let slice of solution) {
        for (let item of slice.items) {
          areaItems += item.widthBin * item.lengthBin
        }
      }

      let lose = totalArea - areaItems
      if (lose < minLose) {
        minLose = lose
        bestSolution = solutions[idSolution]
      }

      idSolution++
    }

    return [bestSolution, minLose]
  },
  getAbleSlices(parcialSolution, slices, space) {
    // função tem o objetivo de pegar as faixas que ainda cabem na área

    // coletando os valores parcial atuais da solução parcial até agora encontrada
    let parcialLength = this.getTotalParcialLength(utils.clonar(parcialSolution))
    let parcialWidth = this.getTotalParcialWidth(utils.clonar(parcialSolution))
    var ableSlices = []
    for (let s of slices) {
      let ifFit = this.verifyIfFitLength(s, parcialLength, space)
      if (ifFit) {
        ableSlices.push(s)
      }
    }

    if (ableSlices.length > 0) {
      return ableSlices
    }
    else {
      return false
    }
  },
  getRandomSlice (ableSlices) {
    // Objetivo desta função é retornar uma faixa aleatória
    if (ableSlices.length > 0) {
      let randomId = utils.getRandomInt(0, ableSlices.length)
      let a = ableSlices[randomId]
      return a
    } else {
      return false
    }
  },
  getTotalParcialLength(parcialSolution) {
    var length = 0
    for (let ps of parcialSolution) {
      length += ps.faixaCorte._length
    }

    return length
  },
  getTotalParcialWidth(parcialSolution) {
    var width = 0
    for (let ps of parcialSolution) {
      width += ps.faixaCorte._width
    }

    return width
  },
  verifyIfFitLength(s, pl, space) {
    let limit = space._length
    let sliceLength = s.faixaCorte._length
    let test = sliceLength + pl
    if (test <= limit ) {
      // console.log('test: ' + sliceLength + ' + ' + pl + ' = ' + (sliceLength + pl) + ' === ' + limit)
      return true
    }

    return false
  }

}
