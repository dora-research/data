const paperScraper = require('./src/paperScraper')
const authorScraper = require('./src/authorScraper')


/**
 * Deal with paper stuffs
 * @param {*} papers 
 */
function dealWithPapers (papers) {
  // augment/edit raw papers
  papers.forEach(e => paperScraper.editPaper(e))
  // save main paper


  paperScraper.savePapers(papers)
  .catch(err => {
    console.log(err)
    process.exit()
  })
  // // save references of paper as empty papers
  // for (const e of paper.RId) {
  //   // if paper id doesn't exist, create empty paper
  //   // no need to update if already exists
  //   const key = String(e)
  //   paperScraper.collection.documentExists(key)
  //   .then(e => {
  //     if (!e) {
  //       return paperScraper.savePaper({ _key: key, Id: -1})
  //     }
  //   })
  //   .catch(err => {
  //     console.log(err)
  //     process.exit()
  //   })
  // }
}

/**
 * Deal with author stuffs
 * @param {*} paper 
 */
function dealWithAuthor (paper) {
  async function func (AA, paper) {
    try {
      let author
      const doc = await authorScraper.collection.document(AA.AuId, true)
      if (doc) {
        const existingAuthor = doc
        author = authorScraper.buildAuthor(AA, paper, existingAuthor.CC)

        // update in db
        authorScraper.collection.update(author._key, author)
      } else {
        author = authorScraper.buildAuthor(AA, paper)

        // save new author to db
        authorScraper.collection.save(author)
      }


    } catch (err) {
      throw new Error('error occurred in author saving')
    }
  }

  for (const e of paper.AA) {
    func(e, paper)
    .catch(err => {
      console.log(err)
      process.exit()
    })
  }
}

let prevYear = null
let count = 0
paperScraper.on('rawPaper', papers => {
  // deal with paper stuffs
  dealWithPapers(papers)
  // deal with author stuffs
  //dealWithAuthor(paper)

  if (!prevYear) prevYear = papers[0].Y
  if (prevYear < papers[0].Y) count = 0
  count += papers.length
  prevYear = papers[0].Y

  console.log('count', count)
  console.log('year', papers[0].Y)
  console.log()

})

paperScraper.scrape(2017, 2014, {
  limit: 400000,
  constantOffset: 100000,
  step: -1
})



