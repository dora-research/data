
class Field {
  constructor (rawField) {
    this.rawField = rawField
  }

  getBase () {
    const base = {
      Id: null,
      FN: null,
      DFN: null,
      CC: null,
      ECC: null,
      FL: null,
      FP: [],
      FC: []
    }

    return Object.assign(base, this.rawField)
  }
}

module.exports = Field