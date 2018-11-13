const Scraper = require('./Scraper')

const config = require('../config')

const MAX_COUNT = 1000 // api max is 1000
const PAUSE = 20000 // in millis
const URL = config.baseUrl + 'evaluate'

const ATTRIBUTES = [
  'Id', 'Ti', 'L', 'Y', 'D', 'CC', 'ECC', 'RId', 'W', 'E', // paper
  'AA.AuN', 'AA.DAuN', 'AA.AuId', 'AA.AfId', 'AA.S', // author
  'F.FId', // field
  'J.JId', // jounrnal
  'C.CId' // conference
]


/**
 * 
 * Emits a 'rawPaper' event for each paper received from API
 */
class PaperScraper extends Scraper {
  constructor () {
    super()
    this.collection = config.db.collection('Paper')
  }

  /**
   * Edit and augment paper object
   * @param {Object} paper 
   */
  editPaper (paper) {
    delete paper.logprob
    paper._key = String(paper.Id)

    // if no authors, create empty author list
    if (!('AA' in paper)) paper.AA = []
    // if no reference key, create empty ref list
    if (!('RId' in paper)) paper.RId = []
    // if no fields, create empty fields list
    if (!('F' in paper)) paper.F = []
    // if no W (words from title and abstract), create empty words list
    if (!('W' in paper)) paper.W = []
    // if no C (conference), create empty C obj
    if (!('C' in paper)) paper.C = {}
    // if no J (journal), create empty C obj
    if (!('J' in paper)) paper.J = {}

    // jsonify Extended metadata
    if ('E' in paper) paper.E = JSON.parse(paper.E)

    // either update updateDate or insert createDate
    const date = new Date().getTime()
    if ('createDate' in paper) paper.updateDate = date
    else paper.createDate = date
  }

  /**
   * Decides to either insert or update in the db
   * depending on whether the doc already exists or not
   * @param {Object} doc 
   */
  async savePapers (papers) {
    try {
      // update all papers that it finds already exist
      const res = await this.collection.bulkUpdate(papers)
      const newPapers = []
      res.filter((e, i) => {
        // errorNum 1202 is document not found
        if (e.error && e.errorNum === 1202)
          newPapers.push(papers[i])
      })
      // insert new papers
      return await this.collection.import(newPapers, { type: 'documents' })
    } catch (err) {
      throw new Error(err)
    }
  }

  


  scrape (start, end, { step = 1, initialOffset = 0, constantOffset = 0, limit = Infinity } = {}) {

    if (initialOffset % MAX_COUNT !== 0)
      throw new Error(`initialOffset must be divisible by MAX_COUNT: ${MAX_COUNT}`)
    if (constantOffset % MAX_COUNT !== 0)
      throw new Error(`constantOffset must be divisible by MAX_COUNT: ${MAX_COUNT}`)
    if (limit !== Infinity && limit % MAX_COUNT !== 0)
      throw new Error(`limit must be divisible by MAX_COUNT: ${MAX_COUNT}`)

    let year = start
    let offset = initialOffset || constantOffset

    const loop = () => {

      const qs = this.constructQs(`Y=${year}`, ATTRIBUTES.join(','), {
        count: MAX_COUNT,
        offset,
        orderby: 'CC:desc'
      })

      this.query(qs, URL)
      .then(res => {
        // emit array of papers
        const papers = res.entities
        this.emit('rawPaper', papers)

        // if returned papers array is less than MAX_COUNT, ran out of papers for that year
        // finished querying this year
        // step to next year
        if (papers.length < MAX_COUNT) {
          if (year === end) this.stop()
          year += step
          offset = constantOffset
          // finished the final year. stop program
        }

      })
      .catch(err => {
        console.log(err)
        process.exit()
      })

      offset += MAX_COUNT

      // the number of queries we've made has bumped up against our limit
      // finished querying this year
      // step to next year
      if (offset === limit) {
        if (year === end) this.stop()
        year += step
        offset = constantOffset
        // finished the final year. stop program
      }

    }

    // start loop
    this.start(loop, PAUSE)
  }
}

module.exports = new PaperScraper()
