const Scraper = require('./Scraper')

const config = require('../config')

const PAUSE = 5000 // in millis
const URL = config.baseUrl + 'evaluate'


/**
 * Used for fields, affiliations, journals, conferences
 * Anything that can be scraped by ID.
 */
class IdScraper extends Scraper {
  constructor (attributes) {
    super()
    this.attributes = attributes
  }

  editEntity (entity) {
    delete entity.logprob
    entity._key = String(entity.Id)

    // jsonify Extended metadata
    if ('E' in entity) entity.E = JSON.parse(entity.E)

    const date = new Date().getTime()
    if ('createDate' in entity) entity.updateDate = date
    else entity.createDate = date
  }

  scrape (id, attributes) {

    const qs = this.constructQs(`Id=${id}`, attributes.join(','))

    this.query(qs, URL)
    .then(res => {
      if (res.entities.length > 1)
        throw new Error(`returned entities list has more than 1 entity\n${res.entities}`)

      const entity = res.entities[0]
      this.emit('update', entity)

    })
    .catch(err => {
      console.log(err)
      process.exit()
    })

    return Promise ((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, PAUSE)
    })

  }

}

module.exports = IdScraper