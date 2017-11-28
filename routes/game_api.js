
var rp = require('request-promise').defaults({ simple: false })


module.exports = function(app){

  app.get('/game_data/:cardNumber', (req, res) => {
    
    var db = require('./../libs/connectdb.js')()
    
    var cardNumber = String(req.params.cardNumber)
    var GameDatas = db.model('GameDatas')

    GameDatas.find({cardNumber: cardNumber}, function(err, docs){
      if(err){
          throw err
      }

      res.send(docs);
      console.log(docs)
      
    })

  })


}