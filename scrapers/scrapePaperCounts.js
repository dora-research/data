const paperCountScraper = require('../src/paperCountScraper')



/**
 * paper count by year, scraper
 */
paperCountScraper.on('update', obj => {
  docSaver.saveDoc({
    _key: paperCountScraper.key,
    count: obj.res.num_entities,
    year: obj.year
  })
})
paperCountScraper.scrape(1900, 2018)

