const config = require('../config')
const Field = require('../entities/Field')
const IdScraper = require('../src/IdScraper')

const ATTRIBUTES = [
  'Id', 'FN', 'DFN', 'CC', 'ECC', 'FL',  // field
  'FP.FN', 'FP.FId', // parent field
  'FC.FN', 'FC.FId' // child field
]

const fieldScraper = new IdScraper('TestField', ATTRIBUTES)


const db = config.db


async function getPapersChunk (offset) {
  const cursor = await db.query(`
  FOR doc IN PaperDev
    SORT doc.createDate ASC
    LIMIT ${offset}, 1000
    RETURN doc
  `)
  return cursor.all()
}


fieldScraper.on('update', async rawField => {
  // clean up document to be inserted
  const baseField = new Field(rawField).getBase()
  const field = fieldScraper.editEntity(baseField)

  console.log('finished scraping field')
  console.log('name:', field.DFN)
  console.log()

  fieldScraper.saveEntity(field)
})


function main (offset) {
  getPapersChunk(offset)
  .then(async papers => {
    if (!papers.length) return // end of PaperDev
    
    for (const paper of papers) {
      if (!paper.F) continue
      for (const field of paper.F) {
        // scrape it now, decide whether to udpate or save later
        // await bc it lets us know when we're ready to query again
        console.log('ready to scrape again, scraping...')
        await fieldScraper.scrape(String(field.FId), ATTRIBUTES)
      }
    }
    // recursively repeat process on new chunk of papers
    main(offset + 1000)
  })
}

main(0)



// TODO: improve querying by taking union of all fields across all papers