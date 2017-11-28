
/*
	Arquivo de conexão para o MariaDb
*/

var port = process.env.PORT || 3306

console.log('Porta para o banco de dados: '+port)

module.exports = function(){

	var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'us-cdbr-iron-east-05.cleardb.net',
	  user     : 'bda03408f294cc',
	  password : '8c97c15a',
		database : 'heroku_2a4e7712c8fe52a',
		port: port
	});

	connection.connect(function(err) {
		if (err) {
			console.error('error connecting: ' + err.stack);
			return;
		}

		console.log('Conexão realizada com sucesso!');

	});

	return connection
}

// ### MODEL MONGODB ###

// module.exports = function(){

// 	var mongoose = require('mongoose')
// 	mongoose.Promise = global.Promise

// 	var uri = 'mongodb://heroku_vg6mwhqp:kcjh3617mgakeo5234fa73ke9n@ds155634.mlab.com:55634/heroku_vg6mwhqp'
	
// 	var connState = mongoose.connection.readyState

// 	if(connState == 0){

// 		mongoose.connect(uri).then(function(){

// 			console.log('MongoDb conectado com sucesso!!!')

// 			// ### Registra Schemas ###

// 			// Pedidos
// 			var pedidosSchema = new mongoose.Schema({
// 				'data_cadastro' : String,
// 				'nome_cliente' : String,
// 				'image_qrcode' : String,
// 				items : [{
// 					'nome_item' : String,
// 					'tipo': String,
// 					'target' : String,
// 					'qtde' : Number
// 				}]
// 			})

// 			mongoose.model('Pedidos', pedidosSchema)

// 			// Locais BR MANIA
// 			var LocaisSchema = new mongoose.Schema({
// 				'COD_CLIENTE' : String,
// 				'NUM_CNPJ' : String,
// 				'NOM_RAZAO_SOCIAL' : String,
// 				'NOM_APELIDO' : String,
// 				'DSC_TIP_POSTO' : String,
// 				'NUM_TEL' : String,
// 				'END_CLIENTE' : String,
// 				'SGL_UF' : String,
// 				'NOM_CIDADE' : String,
// 				'NOM_BAIRRO' : String,
// 				'NUM_CEP' : String,
// 				'LONGITUDE' : String,
// 				'LATITUDE' : String
// 			})

// 			mongoose.model('Locais', LocaisSchema)
			
// 			var PostosSchema = new mongoose.Schema({
// 				'INCL_COD_CLI' : String,
// 				'INCL_NOM_APELIDO_CLI' : String,
// 				'INCL_NOM_RAZ_SOC' : String,
// 				'INCL_NUM_CNPJ_CPF' : String,
// 				'INCL_END_CLI' : String,
// 				'INCL_NUM_END_CLI' : String,
// 				'INCL_NOM_BAI_END_CLI' : String,
// 				'INCL_NOM_MCP' : String,
// 				'INCL_SGL_EST' : String,
// 				'INCL_SGL_PAI' : String,
// 				'INCL_COD_CEP_END_CLI' : String,
// 				'INCL_IND_PGM_CRACHA' : String,
// 				'LATITUDE' : String,
// 				'LONGITUDE': String
// 			})

// 			mongoose.model('Postos', PostosSchema)

// 			// Estoque

// 			var EstoquesSchema = new mongoose.Schema({
// 				'nome_produto' : String,
// 				'valor' : Number,
// 				'qtde' : Number
// 			})

// 			mongoose.model('Estoques', EstoquesSchema)
			
// 		})

// 	}


// 	return mongoose.connection

// }
