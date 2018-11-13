const config = require('./config')
const IdScraper = require('./src/IdScraper')

const ATTRIBUTES = [
  'Id', 'FN', 'DFN', 'CC', 'ECC', 'FL',  // field
  'FP.FN', 'FP.FId', // parent field
  'FC.FN', 'FC.FId' // child field
]

const fieldScraper = new IdScraper('FieldOfStudy', ATTRIBUTES)


const db = config.db
const initialDate = 1538623908609

async function getPapersChunk (createDate) {
  const cursor = await db.query(`
  FOR doc IN Paper
    FILTER doc.createDate > ${createDate}
    SORT doc.createDate ASC
    LIMIT 1000
    RETURN doc
  `)
  return cursor.all()
}

function editField (field) {
  // overwrite any defaults that already exist in the queried field
  const base = { Id: null, FN: null, DFN: null, CC: null, ECC: null, FL: null, FP: [], FC: [] }
  field = Object.assign(base, field)
  return field
}

fieldScraper.on('update', async field => {
  // clean up document to be inserted
  fieldScraper.editEntity(field)
  editField(field)

  fieldScraper.saveEntity(field)
})


function main (createDate) {
  getPapersChunk(createDate)
  .then(async papers => {
    for (const paper of papers) {
      if (!paper.F) continue
      for (const field of paper.F) {
        // scrape it now, decide whether to udpate or save later
        await fieldScraper.scrape(String(field.FId), ATTRIBUTES)
      }
    }
    // recursively repeat process on new chunk of papers
    main(papers[papers.length - 1].createDate)
  })
}

main(initialDate)
