const config = require('../config')


/**
 * 
 * Emits a 'rawPaper' event for each paper received from API
 */
class AuthorScraper {
  constructor () {
    this.collection = config.db.collection('Author')
  }

  /**
   * Edit and augment paper object
   * @param {Object} paper 
   */
  buildAuthor (AA, paper, existingCitations = 0) {

    const author = {
      _key: AA.AuId,
      Id: AA.AuId,
      AuN: AA.AuN,
      DAuN: AA.DAuN,
      derivedCC: existingCitations + paper.CC
    }

    const date = new Date().getTime()
    // author already exists, just updating derived citationc count and others
    if (existingCitations) author.updateDate = date
    else author.createDate = date

    return author
  }

  /**
   * Decides to either insert or update in the db
   * depending on whether the doc already exists or not
   * @param {Object} doc 
   */
  async saveAuthor (author) {
    try {
      let action
      const exists = await this.collection.documentExists(author._key)
      if (exists) {
        await this.collection.update(author._key, author)
        action = 'updated'
      } else {
        await this.collection.save(author)
        action = 'created'
      }
      return { author, action }

    } catch (err) {
      throw new Error(err)
    }
  }

}

module.exports = new AuthorScraper()
