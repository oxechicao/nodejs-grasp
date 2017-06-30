import utils from '../utils'

export default {
  setup: {},
  search (items, espaco, horizontal=true) {
    if (items.length <= 0 ) {
      return false
    }

    let areaTotal = espaco._length * espaco._width
    let minPerda = Infinity
    let sol = []
    let conjunto = []
    for (let x = 1; x <= items.length; x++) {
      let aR = []
      let perda = 0
      let _items = items

      while (_items.length > 0) {
        let r = utils.getRandomInt(0, items.length)
        let i = _items[r]
        _items.splice(r)
        let limit = this.getSumLimit(conjunto, horizontal, i)
        if ((!horizontal && limit > espaco._width) || (horizontal && limit > espaco._length)) {
          // console.log('ULTRAPASSOU O LIMIT: ' + limit + ' > ' + espaco._width + ' || ' + espaco._length)
          continue
        }
        else {
          let area = this.getAreaItems(conjunto, i)
          if (area <= areaTotal) {
            conjunto.push(i)
          }
          else {
            perda = areaTotal - area
            if (perda < minPerda && perda > 0) {
              minPerda = perda
              sol = conjunto
            }

            conjunto = []
            break
          }
        }
      }
    }

    if (conjunto.length > 0) {
      let limit = this.getSumLimit(conjunto, horizontal)
      // console.log(limit > espaco._width)
      if ((horizontal && limit > espaco._width) || (!horizontal && limit > espaco._length)) {
        return false
      }
      else {
        let area = this.getAreaItems(conjunto)

        let perda = areaTotal - area
        if (perda < minPerda && perda > 0) {
          minPerda = perda
          sol = conjunto
        }
      }
    }

    if (minPerda === Infinity) {
      return false
    }

    return {
      items: sol,
      perda: minPerda,
      horizontal: horizontal
    }
  },
  getAreaItems (items, i=false) {
    let sum = 0
    if (i) {
      sum = i.widthBin * i.lengthBin
    }

    for (let j of items) {
      sum += (j.widthBin * j.lengthBin)
    }

    return sum
  },
  getSumLimit (items, horizontal, i=false) {
    let sum = 0
    if (i) {
      sum = horizontal ? i.widthBin : i.lengthBin
    }

    for (let i of items) {
      if (horizontal) {
        sum += i.widthBin
      } else {
        sum += i.lengthBin
      }
    }

    return sum
  },
  getMelhorFaixasDaSolucao(solucao, espacoTotal) {
    var conjuntoSolucoes = []
    var comprimento = espacoTotal._length
    var largura = espacoTotal._width

    for (var x = 0; x <= solucao.length; x++) {
      var conjunto = [solucao[x]]
      var _comprimento = comprimento - solucao[x].faixaCorte._length
      var _largura = largura - solucao[x].faixaCorte._width

      var candidatos  = true
      var i = 1
      while (candidatos && i > 0) {
        candidatos = this.getFaixasCandidatas(_comprimento, _largura, utils.clonar(solucao))
        var sim = true
        var i = candidatos.length*100
        while (candidatos && sim) {
          var rand = utils.getRandomInt(0, candidatos.length)
          var _s = candidatos[rand]
          var _comprimento_ = _s.faixaCorte._length
          var _largura_  = _s.faixaCorte._width
          if (_comprimento_ < _comprimento) {
            conjunto.push(_s)
            _comprimento -= _comprimento_
            candidatos = this.getFaixasCandidatas(_comprimento, _largura, utils.clonar(solucao))
          } else if (_largura_ < _largura) {
            conjunto.push(_s)
            _largura_ -= _largura
            candidatos = this.getFaixasCandidatas(_comprimento, _largura, utils.clonar(solucao))
          }

          i--
          if (i <= 0) {
            sim = false
          }
        }
      }

      conjuntoSolucoes.push(conjunto)
    }

    var melhorSolucao = this.getMelhorSolucao(conjuntoSolucoes)
    // console.log('MELHOR SOLUCAO EVER')
    // console.log(melhorSolucao)

    return melhorSolucao
  },
  getMelhorSolucao (cs) {
    var minimaPerda = Infinity
    var solucao
    for (let c of cs) {
      var p = 0
      for (let s of c) {
        p += s.perda
      }

      if (p < minimaPerda) {
        minimaPerda = p
        solucao = c
      }
    }

    return solucao
  },
  getFaixasCandidatas (c, l, s) {
    var candidatos = []
    for (let _s of s) {
      var _comprimento_ = _s.faixaCorte._length
      var _largura_  = _s.faixaCorte._width
      if (_comprimento_ < c || _largura_ < l) {
        candidatos.push(_s)
      }
    }

    if (candidatos.length <= 0) {
      return false
    }

    return candidatos
  }
}
