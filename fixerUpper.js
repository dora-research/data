const config = require('./config')

// F field should always exist, even as []

async function getPapersChunk (offset) {
  const cursor = await config.db.query(`
  FOR doc IN PaperDev
    SORT doc.createDate ASC
    LIMIT ${offset}, 1000
    RETURN doc
  `)
  return cursor.all()
}

const collection = config.db.collection('PaperDev')

function main (offset) {
  getPapersChunk(offset)
  .then(async papers => {
    if (!papers.length) return // end of PaperDev
    
    for (const paper of papers) {
      if (!paper.F) {
        console.log('found paper without F []')
        console.log(paper)
        paper.F = []
        collection.update(paper._key, paper)
      }
    }
    // recursively repeat process on new chunk of papers
    main(offset + 1000)
  })
}

main(0)