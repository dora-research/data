const Scraper = require('./Scraper')

const config = require('../config')

const PAUSE = 5000 // in millis
const URL = config.baseUrl + 'evaluate'


/**
 * Used for fields, affiliations, journals, conferences
 * Anything that can be scraped by ID.
 */
class IdScraper extends Scraper {
  constructor (collectionName, attributes) {
    super()
    this.collection = config.db.collection(collectionName)
    this.attributes = attributes
  }

  editEntity (entity) {
    delete entity.logprob
    entity._key = String(entity.Id)

    const date = new Date().getTime()
    if ('createDate' in entity) entity.updateDate = date
    else entity.createDate = date

    return entity
  }

  async saveEntity (entity) {
    try {
      const exists = await this.collection.documentExists(entity._key)
      if (exists) { // update
        return await this.collection.update(entity._key, entity)
      } else { // save new doc
        return await this.collection.save(entity)
      }  
    } catch (err) {
      throw new Error(err)
    }
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

    // return a promise that resolves in x seconds
    // so user knows when to scrape again
    return new Promise ((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, PAUSE)
    })

  }

}

module.exports = IdScraper