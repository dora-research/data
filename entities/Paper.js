
class Paper {
  constructor (rawPaper) {
    // jsonify Extended metadata
    if ('E' in rawPaper) rawPaper.E = JSON.parse(rawPaper.E)

    this.rawPaper = rawPaper
  }

  getBase () {
    const base = {
      Id: null,
      Ti: null,
      L: null,
      Y: null,
      D: null,
      CC: null,
      ECC: null,
      RId: {},
      W: [],
      E: {
        ANF: [],
        BT: null,
        BV: null,
        DN: null,
        DOI: null,
        FP: null,
        I: null,
        CC: {},
        IA: {
          IndexLength: null,
          InvertedIndex: {}
        },
        LP: null,
        PB: null,
        PR: [],
        S: [],
        V: null,
        VFN: null,
        VSN: null
      },
      AA: [],
      D: [],
      J: { JId: null },
      C: { CId: null },
      F: []
    }

    return Object.assign(base, this.rawPaper)
  }
}

module.exports = Paper