const Paper = require('../entities/Paper')
const paperScraper = require('../src/paperScraper')




let prevYear = null
let count = 0
paperScraper.on('rawPapers', papers => {
  // deal with paper stuffs
  // augment/edit raw papers
  papers = papers.map(e => new Paper(e).getBase())
  papers = papers.map(e => paperScraper.editPaper(e))

  // save main paper
  paperScraper.savePapers(papers)
  .catch(err => {
    console.log(err)
    process.exit()
  })


  /**
   * logging stuffs
   */
  if (!prevYear) prevYear = papers[0].Y
  if (prevYear < papers[0].Y) count = 0
  count += papers.length
  prevYear = papers[0].Y
  console.log('count', count)
  console.log('year', papers[0].Y)
  console.log()
})

paperScraper.scrape(2013, 2012, {
  limit: 2000,
  step: -1
})



