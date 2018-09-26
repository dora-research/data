const paperScraper = require('./src/paperScraper')
const authorScraper = require('./src/authorScraper')
const paperCountScraper = require('./src/paperCountScraper')
const IdScraper = require('./src/IdScraper')



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

paperScraper.scrape(2015, 2000, {
  limit: 1000000,
  step: -1
})




paperCountScraper.on('update', obj => {
  docSaver.saveDoc({
    _key: paperCountScraper.key,
    count: obj.res.num_entities,
    year: obj.year
  })
})
// paperCountScraper.scrape(1900, 1902)



const db = require('./config').db

// remove temp papers from db
// db.query(`
// FOR doc IN Paper
//   FILTER doc.Id == 0
//   REMOVE doc IN Paper
// `)
// .catch(err => {
//   console.log(err)
// })


// count total papers per year
const year = 2018
// db.query(`
// FOR doc in Paper
//   FILTER doc.Y == ${year}
//   RETURN doc
// `)
// .then(e => {
//   console.log(year)
//   console.log(e.count())
//   console.log()
// })












// const collection = db.collection('Affiliation')

// const doc1 = {number: 1, hello: 'world1'};
// const doc2 = {number: 2, hello: 'world2'};
// Promise.all([
//   collection.save(doc1),
//   collection.save(doc2)
// ])
// .then(e => {
//   return collection.bulkUpdate([
//     {_key: e[0]._key, number: 3},
//     {_key: e[1]._key, number: 4},
//     {_key: 'new key', number: 5}
//   ], {returnNew: true})  
// })
// .then(e => {
//   console.log(e)
// })
// .catch(err => {
//   console.log(err)
// })

