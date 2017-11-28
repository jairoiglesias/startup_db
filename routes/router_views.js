


function distLatLong(lat1,lon1,lat2,lon2) {
  var R = 6371; // raio da terra em km
  var Lati =  Math.PI/180*(lat2-lat1);  
  var Long =  Math.PI/180*(lon2-lon1); 
  var a = 
    Math.sin(Lati/2) * Math.sin(Lati/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(Long/2) * Math.sin(Long/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // distância em km
  return d;
}

module.exports = function(app) {

  app.get('/painel_brmania', (req, res) => {
    res.render('painel_brmania')
  })

  app.get('/frentista', (req, res) => {
    res.render('frentista')
  })

  // app.get('/teste', (req, res) => {
  //   res.render('teste')
  // })

  // Devolve o ultimo pedido gerado
  app.get('/get_last_pedido', (req, res) => {

    var db = require('./../libs/connectdb.js')()

    var Pedidos = db.model('Pedidos')

    Pedidos.find({}).sort({_id:-1}).limit(1).exec((err, docs) => {
      if(err) throw err

      res.send(docs)

    })

  })

  app.get('/pedidos/consulta', (req, res) => {

    var db = require('./../libs/connectdb.js')()
    
    var Pedidos = db.model('Pedidos')

    Pedidos.find({}, function(err, docs){
      if(err){
          throw err
      }

      res.send(docs);
      console.log(docs[0].items[0])
      
    })

  })

  app.get('/locais_brmania/consulta/:limit', (req, res) => {

    var limit = Number(req.params.limit)

    var db = require('./../libs/connectdb.js')()
    
    var Locais = db.model('Locais')

    Locais.find({}).limit(limit).exec(function(err, docs){
      if(err){
          throw err
      }

      res.send(docs);
      
    })

  })

  app.get('/locais_brmania/consulta', (req, res) => {

    var db = require('./../libs/connectdb.js')()
    
    var Locais = db.model('Locais')

    Locais.find({}).limit().exec(function(err, docs){
      if(err){
          throw err
      }

      res.send(docs);
      
    })

  })

  app.get('/postos/consulta', (req, res) => {

    var db = require('./../libs/connectdb.js')()
    
    var Postos = db.model('Postos')

    Postos.find({}, function(err, docs){
      if(err){
          throw err
      }

      res.send(docs);
      
    })

  })

  app.get('/get_estoque/:nome_produto', (req, res) => {

    var nomeProduto = req.params.nome_produto;

    var db = require('./../libs/connectdb.js')()

    var Estoques = db.model('Estoques')

    Estoques.find({nome_produto : nomeProduto}, (err, docs) => {
      console.log(docs)
      res.send(docs)
    })

  })

  // Função para verificar a disponibilidade dos items no estoque

  function verificaEstoque(items){

    return new Promise(function(resolve, reject){

      var db = require('./../libs/connectdb.js')()

      var Estoques = db.model('Estoques')

      var newItems = []
      var semEstoque = false

      items.forEach(function(value, index){

        var nomeProduto = value.nome_produto
        var qtdeRequisitada = value.qtde

        Estoques.find({nome_produto : nomeProduto}, (err, docs) => {
          
          var registro = docs[0];

          if(registro == undefined){
            console.log('Produto inexistente no estoque')
            value.semEstoque = true
            semEstoque = true

          }
          else{
            var qtdeEstoque = registro.qtde

            if((qtdeRequisitada + 5) >= qtdeEstoque){
              console.log('Estoque vazio')
              value.semEstoque = true
              semEstoque = true
            }
            else{
              console.log('Quantidade autorizada para reserva no estoque')
              value.semEstoque = false
            }
          }
          
          newItems.push(value)

          if(index == (items.length - 1)){
            resolve({items: newItems, semEstoque: semEstoque})
          }

        })

      })

    })

  }

  function atualizaEstoque(items){

    return new Promise(function(resolve, reject){

      var db = require('./../libs/connectdb.js')()

      var Estoques = db.model('Estoques')

      var newItems = []
      var semEstoque = false

      items.forEach(function(value, index){

        var nomeProduto = value.nome_produto
        var qtdeRequisitada = value.qtde

        Estoques.find({nome_produto : nomeProduto}, (err, docs) => {
          
          var registro = docs[0];
          var qtdeEstoque = registro.qtde

          Estoques.findOneAndUpdate({nome_produto : nomeProduto}, {qtde: (qtdeEstoque - qtdeRequisitada)}, {upsert:true}, function(err, doc){
            
            if (err) throw err
            resolve('1')

          })

        })

      })

    })

  }

  // ### Efetua o cadastro de um novo pedido no posto devolvendo a imagem do QRCODE em Base64

  app.get('/pedidos/cadastro', (req, res) => {

    var data_cadastro = req.query.data_cadastro;
    var nome_cliente = req.query.nome_cliente;
    var items = req.query.items

    // Converte a String JSON recuperada da URL em um objeto JSON valido
    items = eval(items)
    
    // Verifica a disponibilidade do estoque
    verificaEstoque(items).then(function(itemsProc){

      if(itemsProc.semEstoque == true){
        console.log('sem estoque em um dos items')
        res.send(itemsProc)
      }
      else{

        console.log('estoque tudo ok')

        var db = require('./../libs/connectdb.js')()
        
        var Pedidos = db.model('Pedidos')

        // Cria um novo pedido
        novoPedido = new Pedidos({
          data_cadastro: data_cadastro,
          nome_cliente : nome_cliente
        })

        novoPedido.save(function(err, results){
        
          if(err) throw err

          console.log('cadastrado com sucesso')
          console.log('1')

          atualizaEstoque(items).then(function(){
            res.send(itemsProc)
            console.log('estoque atualizado com sucesso')
          })


          // Inicia a geração da imagem QRCODE

          // var id = String(results._id)
          // console.log(id)

          // var QRCode = require('qrcode')
          
          // QRCode.toDataURL(id, function (err, url) {
          //   console.log('QRCODE processado com sucesso')

          //   console.log(url)

          //   Pedidos.findOneAndUpdate({_id : results._id}, {'image_qrcode' : url}, function(err, docs){
          //     if(err){
          //       throw err
          //     }

          //     res.send(id)

          //   })

          // })


        })

      }

    })

  })

  app.get('/pedidos/:id', (req, res) => {

    var id = req.params.id;

    var db = require('./../libs/connectdb.js')()
    
    var Pedidos = db.model('Pedidos')

    Pedidos.findOne({_id : id}, function(err, docs){
      if(err){
          throw err
      }

      res.send(docs);
      console.log(docs)
      
    })

  })

}