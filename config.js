const Database = require('arangojs').Database

const db = new Database('http://ec2-13-56-188-174.us-west-1.compute.amazonaws.com:8529')
db.useDatabase('dora')
db.useBasicAuth('', '')

module.exports = {
  db,
  baseUrl: 'https://api.labs.cognitive.microsoft.com/academic/v1.0/',
  headers: {
    'Ocp-Apim-Subscription-Key': '0396c9861520451b87ed2217c28a48e7'
  }
}
