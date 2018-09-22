const Database = require('arangojs').Database

const db = new Database('')
db.useDatabase('dora')
db.useBasicAuth('', '')

module.exports = {
  db,
  baseUrl: 'https://api.labs.cognitive.microsoft.com/academic/v1.0/',
  headers: {
    'Ocp-Apim-Subscription-Key': ''
  }
}
